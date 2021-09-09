/* eslint-disable @typescript-eslint/naming-convention */
import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import axios from 'axios';
import CircularJSON from 'circular-json';
import {
  MigrationFailedRepository,
  MigrationRepository,
  TransferRepository,
} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class TransferService {
  model = 'transfer';
  modelId = '';
  url = `${process.env.MIGRATION_URL}/migration/transfers`;
  currentMigrationId = '';
  currentMigrationAt = 0;
  migrationAt = parseFloat(process.env.MIGRATED_AT ?? '0');
  startTime = 0;
  endTime = 0;
  totalMigrated = 0;
  limit = 500;

  constructor(
    @repository(MigrationRepository)
    public migrationRepo: MigrationRepository,

    @repository(MigrationFailedRepository)
    public migrationFailedRepo: MigrationFailedRepository,

    @repository(TransferRepository)
    public transferRepo: TransferRepository,
  ) {}

  /*
   * Add service methods here
   */
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

  async newTransfers() {
    try {
      const migrated = await this.migrationRepo.findOne({
        where: {model: this.model},
      });
      this.currentMigrationId = migrated?.id ?? '';
      this.startTime = migrated?.migratedAt ?? 0;
      this.endTime = this.startTime + 60;
      const transfersV2: any[] = [];
      const transfersV1 = await this.transferRepo.find({
        where: {
          time: {
            between: [this.startTime, this.endTime],
          },
        },
      });

      if (transfersV1.length) {
        transfersV1.map(transfer => {
          transfersV2.push({
            id: transfer._id,
            username: transfer.user_name,
            toUsername: transfer.r_user_name,
            coinCode: transfer.coin,
            amount: transfer.amount,
            code: transfer.code,
            fee: transfer.fee,
            tokenCode: transfer.code,
            status: transfer.status,
            createdAt: (transfer.time ?? 0) * 1000,
          });
        });

        await axios.post(this.url, {transfers: transfersV2});
        const message = `${transfersV1.length} records of TRANSFER was migrated successfully`;
        console.log(message);
      }
      await this.migrationRepo.updateById(migrated?.id, {
        model: this.model,
        migratedAt: this.endTime,
        completed: true,
      });
      const message = `TRANSFER migrated at: ${new Date(this.endTime * 1000)}`;
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

  async migrateAll() {
    try {
      const transfersV1 = await this.transferRepo.find();
      const transfersV2: any[] = [];
      transfersV1.map(transfer => {
        transfersV2.push({
          id: transfer._id,
          username: transfer.user_name,
          toUsername: transfer.r_user_name,
          coinCode: transfer.coin,
          amount: transfer.amount,
          code: transfer.code,
          fee: transfer.fee,
          tokenCode: transfer.code,
          status: transfer.status,
          createdAt: (transfer.time ?? 0) * 1000,
        });
      });
      const migrated = await axios.post(this.url, {transfers: transfersV2});
      const res = CircularJSON.stringify(migrated);
      return res;
    } catch (error) {
      return error;
    }
  }

  async migrate() {
    try {
      const found = await this.migrationRepo.findById(this.modelId);
      if (found.locked) {
        console.log('Transfer table is locked');
        return;
      } else {
        console.log('---start migration transfer---');
        const unmigrations = await this.migrationFailedRepo.find({
          where: {model: this.model},
        });
        unmigrations.map(async transfer => {
          try {
            const _transfer = await axios.post(this.url, {
              transfer: {
                id: transfer._id,
                username: transfer.user_name,
                toUsername: transfer.r_user_name,
                coinCode: transfer.coin,
                amount: transfer.amount,
                code: transfer.code,
                fee: transfer.fee,
                tokenCode: transfer.code,
                status: transfer.status,
                createdAt: (transfer.time ?? 0) * 1000,
              },
            });
            if (
              _transfer.data.statusCode === 200 ||
              _transfer.data.code === 11000
            ) {
              await this.migrationFailedRepo.deleteById(transfer._id);
              console.log(`done error transfer: ${transfer._id}`);
            } else {
              console.log('error transfer again:', _transfer.data.code);
            }
          } catch (error) {
            console.log('error transfer again:', transfer._id, error);
          }
        });

        this.totalMigrated = found.totalMigrated ?? 0;
        const transfers = await this.transferRepo.find({
          skip: this.totalMigrated,
          limit: this.limit,
        });
        transfers.map(async transfer => {
          try {
            const _transfer = await axios.post(this.url, {
              transfer: {
                id: transfer._id,
                username: transfer.user_name,
                toUsername: transfer.r_user_name,
                coinCode: transfer.coin,
                amount: transfer.amount,
                code: transfer.code,
                fee: transfer.fee,
                tokenCode: transfer.code,
                status: transfer.status,
                createdAt: (transfer.time ?? 0) * 1000,
              },
            });
            if (_transfer.data.statusCode === 200) {
              console.log('done transfer:', transfer._id);
            } else {
              console.log(
                'transfer error something:',
                _transfer.data.statusCode,
              );
              await this.migrationFailedRepo.create({
                model: this.model,
                errorCode: _transfer.data.statusCode,
                ...transfer,
              });
            }
          } catch (error) {
            console.log('error transfer:', transfer._id);
            await this.migrationFailedRepo.create({
              model: this.model,
              ...transfer,
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
