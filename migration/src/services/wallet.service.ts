/* eslint-disable @typescript-eslint/naming-convention */
import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import axios from 'axios';
import CircularJSON from 'circular-json';
import {Wallet} from '../models/wallet.model';
import {
  CustomerRepository,
  MigrationFailedRepository,
  MigrationRepository,
  WalletRepository,
} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class WalletService {
  model = 'wallet';
  modelId = '';
  url = `${process.env.MIGRATION_URL}/migration/wallets`;
  migrationAt = parseFloat(process.env.MIGRATED_AT ?? '0');
  currentMigrationId = '';
  currentMigrationAt = 0;
  startTime = 0;
  endTime = 0;
  startUpdateTime = 0;
  endUpdateTime = 0;
  totalMigrated = 0;
  limit = 500;

  constructor(
    @repository(MigrationRepository)
    public migrationRepo: MigrationRepository,

    @repository(MigrationFailedRepository)
    public migrationFailedRepo: MigrationFailedRepository,

    @repository(WalletRepository)
    public walletRepo: WalletRepository,

    @repository(CustomerRepository)
    public customerRepo: CustomerRepository,
  ) {}

  async init() {
    const migrated = await this.migrationRepo.findOne({
      where: {model: this.model},
    });
    if (migrated) {
      this.modelId = migrated.id ?? '';
      await this.migrationRepo.updateById(migrated.id ?? '', {
        migratedAt: this.migrationAt,
        completed: false,
      });
    } else {
      const migration = await this.migrationRepo.create({
        model: this.model,
        migratedAt: new Date().getTime(),
        completed: false,
      });
      this.modelId = migration.id ?? '';
    }
  }

  async newWallets() {
    try {
      const migrated = await this.migrationRepo.findOne({
        where: {model: this.model},
      });
      this.currentMigrationId = migrated?.id ?? '';
      this.startTime = migrated?.migratedAt ?? 0;
      this.endTime = this.startTime + 60;
      const walletsV1 = await this.walletRepo.find({
        where: {
          time: {
            between: [this.startTime, this.endTime],
          },
        },
      });

      if (walletsV1.length) {
        const walletsV2 = await this.toWalletsV2(walletsV1);
        await axios.post(`${this.url}/migration/wallets`, {
          wallets: walletsV2,
        });
        const message = `${walletsV1.length} records of WALLET was migrated successfully`;
        console.log(message);
      }
      await this.migrationRepo.updateById(migrated?.id, {
        model: this.model,
        migratedAt: this.endTime,
        completed: true,
      });
      const message = `WALLET migrated at: ${new Date(this.endTime * 1000)}`;
      console.log(message);
      return message;
    } catch (error) {
      await this.migrationRepo.updateById(this.currentMigrationId, {
        model: this.model,
        migratedAt: this.endTime,
        completed: false,
      });
    }
  }

  async updateWallets() {
    try {
      const migrated = await this.migrationRepo.findOne({
        where: {model: this.model},
      });
      this.currentMigrationId = migrated?.id ?? '';
      this.startUpdateTime = migrated?.migratedAt ?? 0;
      this.endUpdateTime = this.startUpdateTime + 60;
      const walletsV2: any[] = [];
      const walletsV1 = await this.walletRepo.find({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          time_modified: {
            between: [this.startUpdateTime, this.endUpdateTime],
          },
        },
      });

      if (walletsV1.length) {
        walletsV1.map(wallet => {
          walletsV2.push({
            id: wallet._id,
            balance: wallet.balance,
            updatedAt: new Date(wallet.time_modified ?? 0).getTime(),
          });
        });
        await axios.put(this.url, {wallets: walletsV2});
        const message = `${walletsV1.length} records of WALLET was migrated successfully`;
        console.log(message);
      }
      await this.migrationRepo.updateById(migrated?.id, {
        model: 'wallet',
        migratedAt: this.endUpdateTime,
        completed: true,
      });
      const message = `UPDATING WALLET migrated at: ${new Date(
        this.endUpdateTime * 1000,
      )}`;
      console.log(message);
      return message;
    } catch (error) {
      await this.migrationRepo.updateById(this.currentMigrationId, {
        model: 'wallet',
        migratedAt: this.endUpdateTime,
        completed: false,
      });
    }
  }

  async migrateAll() {
    try {
      const walletsV1 = await this.walletRepo.find();
      const walletsV2 = await this.toWalletsV2(walletsV1);
      const migrated = await axios.post(this.url, {
        wallets: walletsV2,
      });
      const res = CircularJSON.stringify(migrated);
      return res;
    } catch (error) {
      return error;
    }
  }

  async toWalletsV2(list: Wallet[]) {
    return new Promise(resolve => {
      const out: any[] = [];
      list.map(async (wallet, index) => {
        const customer = await this.customerRepo.findOne({
          where: {UserName: wallet.user_name},
        });
        out.push({
          id: wallet._id,
          userId: customer?._id,
          username: wallet.user_name,
          coinCode: wallet.coin,
          balance: wallet.balance,
          status: wallet.status,
          createdAt: new Date(wallet.time_created ?? 0).getTime(),
          updatedAt: new Date(wallet.time_modified ?? 0).getTime(),
        });
        if (index === list.length - 1) {
          resolve(out);
        }
      });
    });
  }

  async migrate() {
    try {
      const found = await this.migrationRepo.findById(this.modelId);
      if (found.locked) {
        console.log('Wallet table is locked');
        return;
      } else {
        console.log('---start migration wallet---');
        const unmigrations = await this.migrationFailedRepo.find({
          where: {model: this.model},
        });
        unmigrations.map(async wallet => {
          try {
            const _wallet = await axios.post(this.url, {
              wallet: {
                id: wallet._id,
                userId: wallet?.userId,
                username: wallet.user_name,
                coinCode: wallet.coin,
                balance: wallet.balance,
                status: wallet.status,
                createdAt: new Date(wallet.time_created ?? 0).getTime(),
                updatedAt: new Date(wallet.time_modified ?? 0).getTime(),
              },
            });
            if (
              _wallet.data.statusCode === 200 ||
              _wallet.data.code === 11000
            ) {
              await this.migrationFailedRepo.deleteById(wallet._id);
              console.log(`done error wallet: ${wallet._id}`);
            } else {
              console.log('error wallet again:', _wallet);
            }
          } catch (error) {
            console.log('error wallet again:', wallet._id, error);
          }
        });

        this.totalMigrated = found.totalMigrated ?? 0;
        const wallets = await this.walletRepo.find({
          skip: this.totalMigrated,
          limit: this.limit,
        });
        wallets.map(async wallet => {
          const customer = await this.customerRepo.findOne({
            where: {UserName: wallet.user_name},
          });
          try {
            const _wallet = await axios.post(this.url, {
              wallet: {
                id: wallet._id,
                userId: customer?._id ?? '0',
                username: wallet.user_name,
                coinCode: wallet.coin,
                balance: wallet.balance,
                status: wallet.status,
                createdAt: new Date(wallet.time_created ?? 0).getTime(),
                updatedAt: new Date(wallet.time_modified ?? 0).getTime(),
              },
            });
            if (_wallet.data.statusCode === 200) {
              console.log('done wallet:', wallet._id);
            } else {
              console.log('wallet error something:', _wallet?.data?.statusCode);
              await this.migrationFailedRepo.create({
                model: this.model,
                errorCode: _wallet?.data?.statusCode,
                userId: customer?._id ?? '0',
                ...wallet,
              });
            }
          } catch (error) {
            console.log('error wallet:', wallet._id);
            await this.migrationFailedRepo.create({
              model: this.model,
              errorCode: error?.data?.statusCode,
              userId: customer?._id ?? '0',
              ...wallet,
            });
          }
          this.totalMigrated++;
          await this.migrationRepo.updateById(this.modelId, {
            totalMigrated: this.totalMigrated,
          });
        });
      }
    } catch (error) {
      return error;
    }
  }
}
