/* eslint-disable @typescript-eslint/naming-convention */
import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import axios from 'axios';
import CircularJSON from 'circular-json';
import {
  AffilicateWeeklyRepository,
  MigrationFailedRepository,
  MigrationRepository,
} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class WeeklyAffiliateService {
  model = 'volume-affiliate';
  modelId = '';
  url = `${process.env.MIGRATION_URL}/migration/affiliates`;
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

    @repository(AffilicateWeeklyRepository)
    public weeklyAffiliateRepo: AffilicateWeeklyRepository,
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

  async newWeeklyAffiliates() {
    try {
      const migrated = await this.migrationRepo.findOne({
        where: {model: this.model},
      });
      this.currentMigrationId = migrated?.id ?? '';
      this.startTime = migrated?.migratedAt ?? 0;
      this.endTime = this.startTime + 60;
      const affiliatesV2: any[] = [];
      const affiliatesV1 = await this.weeklyAffiliateRepo.find({
        where: {
          or: [
            {
              created_time: {
                between: [this.startTime, this.endTime],
              },
            },
            {
              updated_time: {
                between: [this.startTime, this.endTime],
              },
            },
          ],
        },
      });

      if (affiliatesV1.length) {
        affiliatesV1.map(affiliate => {
          affiliatesV2.push({
            id: affiliate._id,
            username: affiliate.user_name,
            week: affiliate.week,
            month: affiliate.month,
            year: affiliate.year,
            casinoPgv: affiliate.casino_pgv,
            casinoPv: affiliate.casino_pv,
            casinoLevel: affiliate.casino_level,
            createdAt: (affiliate.created_time ?? 0) * 1000,
            affiliateType: 'WEEKLY-VOLUME',
          });
        });
        await axios.post(this.url, {affiliates: affiliatesV2});
        const message = `${affiliatesV1.length} records of WEEKLY VOLUME was migrated successfully`;
        console.log(message);
      }
      await this.migrationRepo.updateById(migrated?.id, {
        model: this.model,
        migratedAt: this.endTime,
        completed: true,
      });
      const message = `WEEKLY VOLUME migrated at: ${new Date(
        this.endTime * 1000,
      )}`;
      console.log(message);
      return message;
    } catch (error) {
      return await this.migrationRepo.updateById(this.currentMigrationId, {
        model: this.model,
        migratedAt: this.endTime,
        completed: false,
      });
    }
  }

  async migrateAll() {
    try {
      const affiliateV1 = await this.weeklyAffiliateRepo.find();
      const affiliateV2: any[] = [];
      affiliateV1.map(affiliate => {
        affiliateV2.push({
          id: affiliate._id,
          username: affiliate.user_name,
          week: affiliate.week,
          month: affiliate.month,
          year: affiliate.year,
          casinoPgv: affiliate.casino_pgv,
          casinoPv: affiliate.casino_pv,
          casinoLevel: affiliate.casino_level,
          createdAt: (affiliate.created_time ?? 0) * 1000,
          affiliateType: 'WEEKLY-VOLUME',
        });
      });
      const migrated = await axios.post(this.url, {affiliates: affiliateV2});
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
        console.log('Affiliate table is locked');
        return;
      } else {
        console.log('---start migration weekly volume---');
        const unmigrations = await this.migrationFailedRepo.find({
          where: {model: this.model},
        });
        unmigrations.map(async affiliate => {
          try {
            const _affiliate = await axios.post(this.url, {
              affiliate: {
                id: affiliate._id,
                username: affiliate.user_name,
                week: affiliate.week,
                month: affiliate.month,
                year: affiliate.year,
                casinoPgv: affiliate.casino_pgv,
                casinoPv: affiliate.casino_pv,
                casinoLevel: affiliate.casino_level,
                createdAt: (affiliate.created_time ?? 0) * 1000,
                affiliateType: 'WEEKLY-VOLUME',
              },
            });
            if (
              _affiliate.data.statusCode === 200 ||
              _affiliate.data.code === 11000
            ) {
              await this.migrationFailedRepo.deleteById(affiliate._id);
              console.log(`done error volume affiliate: ${affiliate._id}`);
            } else {
              console.log('error volume affiliate again:', _affiliate);
            }
          } catch (error) {
            console.log('error volume affiliate again:', affiliate._id, error);
          }
        });

        this.totalMigrated = found.totalMigrated ?? 0;
        const affiliates = await this.weeklyAffiliateRepo.find({
          skip: this.totalMigrated,
          limit: this.limit,
        });
        affiliates.map(async affiliate => {
          try {
            const _affiliate = await axios.post(this.url, {
              affiliate: {
                id: affiliate._id,
                username: affiliate.user_name,
                week: affiliate.week,
                month: affiliate.month,
                year: affiliate.year,
                casinoPgv: affiliate.casino_pgv,
                casinoPv: affiliate.casino_pv,
                casinoLevel: affiliate.casino_level,
                createdAt: (affiliate.created_time ?? 0) * 1000,
                affiliateType: 'WEEKLY-VOLUME',
              },
            });
            if (_affiliate.data.statusCode === 200) {
              console.log('done volume affiliate:', affiliate._id);
            } else {
              console.log(
                'volume affiliate error something:',
                _affiliate?.data?.statusCode,
              );
              await this.migrationFailedRepo.create({
                model: this.model,
                errorCode: _affiliate?.data?.statusCode,
                ...affiliate,
              });
            }
          } catch (error) {
            console.log('error volume affiliate:', affiliate._id);
            await this.migrationFailedRepo.create({
              model: this.model,
              errorCode: error?.data?.statusCode,
              ...affiliate,
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
