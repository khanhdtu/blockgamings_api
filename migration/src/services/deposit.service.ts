/* eslint-disable @typescript-eslint/naming-convention */
import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import axios from 'axios';
import CircularJSON from 'circular-json';
import {
  DepositRepository,
  MigrationFailedRepository,
  MigrationRepository,
} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class DepositService {
  model = 'deposit';
  modelId = '';
  url = `${process.env.MIGRATION_URL}/migration/deposits`;
  migrationAt = parseFloat(process.env.MIGRATED_AT ?? '0');
  currentMigrationId = '';
  currentMigrationAt = 0;
  startTime = 0;
  endTime = 0;
  totalMigrated = 0;
  limit = 500;

  constructor(
    @repository(MigrationRepository)
    public migrationRepo: MigrationRepository,

    @repository(MigrationFailedRepository)
    public migrationFailedRepo: MigrationFailedRepository,

    @repository(DepositRepository)
    public depositRepo: DepositRepository,
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

  async newDeposits() {
    try {
      const migrated = await this.migrationRepo.findOne({
        where: {model: this.model},
      });
      this.currentMigrationId = migrated?.id ?? '';
      this.startTime = migrated?.migratedAt ?? 0;
      this.endTime = this.startTime + 60;
      const depositsV2: any[] = [];
      const depositsV1 = await this.depositRepo.find({
        where: {
          time: {
            between: [this.startTime, this.endTime],
          },
        },
      });

      if (depositsV1.length) {
        depositsV1.map(deposit => {
          depositsV2.push({
            id: deposit._id,
            username: deposit.user_name,
            coinCode: deposit.coin,
            amount: deposit.amount,
            amountUsdt: deposit.amount_usd,
            amountEuro: deposit.amount_euro,
            rate: deposit.rate,
            type: deposit.type,
            createdAt: new Date(
              deposit.created_time?.toString() ?? '',
            ).getTime(),
          });
        });
        await axios.post(this.url, {deposits: depositsV2});
        const message = `${depositsV1.length} records of DEPOSIT was migrated successfully`;
        console.log(message);
      }

      await this.migrationRepo.updateById(migrated?.id, {
        model: this.model,
        migratedAt: this.endTime,
        completed: true,
      });
      const message = `DEPOSIT migrated at: ${new Date(this.endTime * 1000)}`;
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
      const depositsV1 = await this.depositRepo.find();
      const depositsV2: any[] = [];
      depositsV1.map(deposit => {
        depositsV2.push({
          id: deposit._id,
          username: deposit.user_name,
          coinCode: deposit.coin,
          amount: deposit.amount,
          amountUsdt: deposit.amount_usd,
          amountEuro: deposit.amount_euro,
          rate: deposit.rate,
          type: deposit.type,
          createdAt: new Date(deposit.created_time?.toString() ?? '').getTime(),
        });
      });
      const migrated = await axios.post(this.url, {deposits: depositsV2});
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
        console.log('Deposit table is locked');
        return;
      } else {
        console.log('---start migration deposit---');
        const unmigrations = await this.migrationFailedRepo.find({
          where: {model: this.model},
        });
        unmigrations.map(async deposit => {
          try {
            const _deposit = await axios.post(this.url, {
              deposit: {
                id: deposit._id,
                username: deposit.user_name,
                coinCode: deposit.coin,
                amount: deposit.amount,
                amountUsdt: deposit.amount_usd,
                amountEuro: deposit.amount_euro,
                rate: deposit.rate,
                type: deposit.type,
                createdAt: new Date(
                  deposit.created_time?.toString() ?? '',
                ).getTime(),
              },
            });
            if (
              _deposit.data.statusCode === 200 ||
              _deposit.data.code === 11000
            ) {
              await this.migrationFailedRepo.deleteById(deposit._id);
              console.log(`done error deposit: ${deposit._id}`);
            } else {
              console.log(`done error deposit: ${deposit._id}`);
            }
          } catch (error) {
            console.log('error deposit again:', deposit._id, error);
          }
        });

        this.totalMigrated = found.totalMigrated ?? 0;
        const deposits = await this.depositRepo.find({
          skip: this.totalMigrated,
          limit: this.limit,
        });
        deposits.map(async deposit => {
          try {
            const _deposit = await axios.post(this.url, {
              deposit: {
                id: deposit._id,
                username: deposit.user_name,
                coinCode: deposit.coin,
                amount: deposit.amount,
                amountUsdt: deposit.amount_usd,
                amountEuro: deposit.amount_euro,
                rate: deposit.rate,
                type: deposit.type,
                createdAt: new Date(
                  deposit.created_time?.toString() ?? '',
                ).getTime(),
              },
            });
            if (_deposit.data.statusCode === 200) {
              console.log('done deposit:', deposit._id);
            } else {
              console.log('deposit error something:', _deposit.data.statusCode);
              await this.migrationFailedRepo.create({
                model: this.model,
                errorCode: _deposit.data.statusCode,
                ...deposit,
              });
            }
          } catch (error) {
            console.log('error deposit:', deposit._id);
            await this.migrationFailedRepo.create({
              model: this.model,
              ...deposit,
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
