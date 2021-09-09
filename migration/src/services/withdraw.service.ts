/* eslint-disable @typescript-eslint/naming-convention */
import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import axios from 'axios';
import CircularJSON from 'circular-json';
import {
  MigrationFailedRepository,
  MigrationRepository,
  WithdrawalRepository,
} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class WithdrawService {
  model = 'withdraw';
  modelId = '';
  url = `${process.env.MIGRATION_URL}/migration/withdraws`;
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

    @repository(WithdrawalRepository)
    public withdrawRepo: WithdrawalRepository,
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

  async newWithdraws() {
    try {
      const migrated = await this.migrationRepo.findOne({
        where: {model: this.model},
      });
      this.currentMigrationId = migrated?.id ?? '';
      this.startTime = migrated?.migratedAt ?? 0;
      this.endTime = this.startTime + 60;
      const withdrawsV2: any[] = [];
      const withdrawsV1 = await this.withdrawRepo.find({
        where: {
          time: {
            between: [this.startTime, this.endTime],
          },
        },
      });

      if (withdrawsV1.length) {
        withdrawsV1.map(withdraw => {
          withdrawsV2.push({
            id: withdraw._id,
            username: withdraw.user_name,
            coinCode: withdraw.coin,
            coinType: withdraw.coin_type,
            amount: withdraw.amount,
            amountUsdt: withdraw.amount_usd,
            amountEuro: withdraw.amount_euro,
            fee: withdraw.fee,
            rate: withdraw.rate,
            confirmed: withdraw.is_confirmed,
            paid: withdraw.is_paid,
            verifyCode: withdraw.comfirm_code ?? 0,
            smsVerifyCode: withdraw.sms_code ?? 0,
            tokenCode: withdraw.code,
            txid: withdraw.txid,
            address: withdraw.address,
            status: withdraw.status,
            createdAt: (withdraw.time ?? 0) * 1000,
          });
        });
        await axios.post(this.url, {withdraws: withdrawsV2});
        const message = `${withdrawsV1.length} records of WITHDRAW was migrated successfully`;
        console.log(message);
      }
      await this.migrationRepo.updateById(migrated?.id, {
        model: this.model,
        migratedAt: this.endTime,
        completed: true,
      });
      const message = `WITHDRAW migrated at: ${new Date(this.endTime * 1000)}`;
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
      const withdrawsV1 = await this.withdrawRepo.find();
      const withdrawsV2: any[] = [];
      withdrawsV1.map(withdraw => {
        withdrawsV2.push({
          id: withdraw._id,
          username: withdraw.user_name,
          coinCode: withdraw.coin,
          coinType: withdraw.coin_type,
          amount: withdraw.amount,
          amountUsdt: withdraw.amount_usd,
          amountEuro: withdraw.amount_euro,
          fee: withdraw.fee,
          rate: withdraw.rate,
          confirmed: withdraw.is_confirmed,
          paid: withdraw.is_paid,
          verifyCode: withdraw.comfirm_code ?? 0,
          smsVerifyCode: withdraw.sms_code ?? 0,
          tokenCode: withdraw.code,
          txid: withdraw.txid,
          address: withdraw.address,
          status: withdraw.status,
          createdAt: (withdraw.time ?? 0) * 1000,
        });
      });
      const migrated = await axios.post(this.url, {withdraws: withdrawsV2});
      const res = CircularJSON.stringify(migrated);
      return res;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async migrate() {
    try {
      const found = await this.migrationRepo.findById(this.modelId);
      if (found.locked) {
        console.log('Withdraw table is locked');
        return;
      } else {
        console.log('---start migration withdraw---');
        const unmigrations = await this.migrationFailedRepo.find({
          where: {model: this.model},
        });
        unmigrations.map(async withdraw => {
          try {
            const _withdraw = await axios.post(this.url, {
              withdraw: {
                id: withdraw._id,
                username: withdraw.user_name,
                coinCode: withdraw.coin,
                coinType: withdraw.coin_type,
                amount: withdraw.amount,
                amountUsdt: withdraw.amount_usd,
                amountEuro: withdraw.amount_euro,
                fee: withdraw.fee,
                rate: withdraw.rate,
                confirmed: withdraw.is_confirmed,
                paid: withdraw.is_paid,
                verifyCode: withdraw.comfirm_code ?? 0,
                smsVerifyCode: withdraw.sms_code ?? 0,
                tokenCode: withdraw.code,
                txid: withdraw.txid,
                address: withdraw.address,
                status: withdraw.status,
                createdAt: (withdraw.time ?? 0) * 1000,
              },
            });
            if (
              _withdraw.data.statusCode === 200 ||
              _withdraw.data.code === 11000
            ) {
              await this.migrationFailedRepo.deleteById(withdraw._id);
              console.log(`done error withdraw: ${withdraw._id}`);
            } else {
              console.log('error withdraw again:', _withdraw);
            }
          } catch (error) {
            console.log('error withdraw again:', withdraw._id, error);
          }
        });

        this.totalMigrated = found.totalMigrated ?? 0;
        const withdraws = await this.withdrawRepo.find({
          skip: this.totalMigrated,
          limit: this.limit,
        });
        withdraws.map(async withdraw => {
          try {
            const _withdraw = await axios.post(this.url, {
              withdraw: {
                id: withdraw._id,
                username: withdraw.user_name,
                coinCode: withdraw.coin,
                coinType: withdraw.coin_type,
                amount: withdraw.amount,
                amountUsdt: withdraw.amount_usd,
                amountEuro: withdraw.amount_euro,
                fee: withdraw.fee,
                rate: withdraw.rate,
                confirmed: withdraw.is_confirmed,
                paid: withdraw.is_paid,
                verifyCode: withdraw.comfirm_code ?? 0,
                smsVerifyCode: withdraw.sms_code ?? 0,
                tokenCode: withdraw.code,
                txid: withdraw.txid,
                address: withdraw.address,
                status: withdraw.status,
                createdAt: (withdraw.time ?? 0) * 1000,
              },
            });
            if (_withdraw.data.statusCode === 200) {
              console.log('done withdraw:', withdraw._id);
            } else {
              console.log(
                'withdraw error something:',
                _withdraw?.data?.statusCode,
              );
              await this.migrationFailedRepo.create({
                model: this.model,
                errorCode: _withdraw?.data?.statusCode,
                ...withdraw,
              });
            }
          } catch (error) {
            console.log('error  withdraw:', withdraw._id);
            await this.migrationFailedRepo.create({
              model: this.model,
              errorCode: error?.data?.statusCode,
              ...withdraw,
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
