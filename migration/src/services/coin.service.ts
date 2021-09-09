/* eslint-disable @typescript-eslint/naming-convention */
import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import axios from 'axios';
import CircularJSON from 'circular-json';
import {
  AddressRepository,
  CustomerRepository,
  MigrationFailedRepository,
  MigrationRepository,
  CoinRepository,
} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class CoinService {
  model = 'coin';
  modelId = '';
  url = `${process.env.MIGRATION_URL}/migration/currency`;
  migrationAt = parseFloat(process.env.MIGRATED_AT ?? '0');
  currentMigrationId = '';
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

    @repository(CoinRepository)
    public coinRepo: CoinRepository,
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
      await this.migrationRepo.updateById(migrated.id, {
        migratedAt: this.migrationAt,
      });
    } else {
      const migration = await this.migrationRepo.create({
        model: this.model,
        migratedAt: this.migrationAt,
        completed: false,
      });
      this.modelId = migration.id ?? '';
    }
  }

  async migrate() {
    try {
      const found = await this.migrationRepo.findById(this.modelId);
      if (found.locked) {
        console.log('Coin table is locked');
        return;
      } else {
        console.log('---start migration coin---');
        const unmigrations = await this.migrationFailedRepo.find({
          where: {model: this.model},
        });
        unmigrations.map(async coin => {
          try {
            await axios.post(this.url, {
              currency: {
                id: coin._id,
                coinAddress: coin.coin_address ?? '',
                destinationTag: coin.destination_tag ?? '',
                coinCode: coin.coin_code,
                coinName: coin.coin_name,
                tokenName: coin.token_name,
                tokenCode: coin.token,
                symbol: coin.symbol ?? '',
                deposit: true,
                withdraw: coin.withdraw ? true : false,
                transfer: coin.transfer ? true : false,
                convert: coin.convert ? true : false,
                status: coin.status ?? '',
                order: coin.order,
              },
            });
            await this.migrationFailedRepo.deleteById(coin._id);
            console.log(`done error coin: ${coin._id}`);
          } catch (error) {
            console.log('error coin again:', coin._id, error);
          }
        });

        this.totalMigrated = found.totalMigrated ?? 0;
        const coins = await this.coinRepo.find({
          skip: this.totalMigrated,
          limit: this.limit,
        });
        coins.map(async coin => {
          try {
            const _coin = await axios.post(this.url, {
              currency: {
                id: coin._id,
                coinAddress: coin.coin_address ?? '',
                destinationTag: coin.destination_tag ?? '',
                coinCode: coin.coin_code,
                coinName: coin.coin_name,
                tokenName: coin.token_name,
                tokenCode: coin.token,
                symbol: coin.symbol ?? '',
                deposit: true,
                withdraw: coin.withdraw ? true : false,
                transfer: coin.transfer ? true : false,
                convert: coin.convert ? true : false,
                status: coin.status ?? '',
                order: coin.order,
              },
            });
            if (_coin.data.statusCode === 200) {
              console.log('done coin:', coin._id);
            } else {
              console.log('coin error something:', _coin.data.statusCode);
              await this.migrationFailedRepo.create({
                model: this.model,
                errorCode: _coin.data.statusCode,
                ...coin,
              });
            }
          } catch (error) {
            console.log('error coin:', coin._id);
            await this.migrationFailedRepo.create({
              model: this.model,
              ...coin,
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
