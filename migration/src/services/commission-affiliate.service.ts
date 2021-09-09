/* eslint-disable @typescript-eslint/naming-convention */
import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import axios from 'axios';
import CircularJSON from 'circular-json';
import {
  AffilicateCommissionRepository,
  MigrationFailedRepository,
  MigrationRepository,
} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class CommissionAffiliateService {
  model = 'commission-affiliate';
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

    @repository(AffilicateCommissionRepository)
    public commissionAffiliateRepo: AffilicateCommissionRepository,
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

  async newCommissionAffiliates() {
    try {
      const migrated = await this.migrationRepo.findOne({
        where: {model: this.model},
      });
      this.currentMigrationId = migrated?.id ?? '';
      this.startTime = migrated?.migratedAt ?? 0;
      this.endTime = this.startTime + 60;
      const affiliatesV2: any[] = [];
      const affiliatesV1 = await this.commissionAffiliateRepo.find({
        where: {
          time: {
            between: [this.startTime, this.endTime],
          },
        },
      });

      if (affiliatesV1.length) {
        affiliatesV1.map(affiliate => {
          affiliatesV2.push({
            id: affiliate._id,
            investId: affiliate.invest_id,
            username: affiliate.user_name,
            week: affiliate.week,
            month: affiliate.month,
            year: affiliate.year,
            type: affiliate.type,
            iType: affiliate.i_type,
            pgv: affiliate.pgv,
            pgvPercent: affiliate.pgv_percent,
            package: affiliate.package_name,
            note: affiliate.note,
            desc: affiliate.desc,
            amount: affiliate.amount,
            amountUsd: affiliate.amount_usd,
            rate: affiliate.rate,
            status: affiliate.status,
            title: affiliate.title,
            createdAt: (affiliate.time ?? 0) * 1000,
            affiliateType: 'WEEKLY-COMMISSION',
          });
        });
        await axios.post(this.url, {affiliates: affiliatesV2});
        const message = `${affiliatesV1.length} records of WEEKLY COMMISSION was migrated successfully`;
        console.log(message);
      }
      await this.migrationRepo.updateById(migrated?.id, {
        model: this.model,
        migratedAt: this.endTime,
        completed: true,
      });
      const message = `WEEKLY COMMISSION migrated at: ${new Date(
        this.endTime * 1000,
      )}`;
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
      const affiliateV1 = await this.commissionAffiliateRepo.find();
      const affiliateV2: any[] = [];
      affiliateV1.map(affiliate => {
        affiliateV2.push({
          id: affiliate._id,
          investId: affiliate.invest_id,
          username: affiliate.user_name,
          week: affiliate.week,
          month: affiliate.month,
          year: affiliate.year,
          type: affiliate.type,
          iType: affiliate.i_type,
          pgv: affiliate.pgv,
          pgvPercent: affiliate.pgv_percent,
          package: affiliate.package_name,
          note: affiliate.note,
          desc: affiliate.desc,
          amount: affiliate.amount,
          amountUsd: affiliate.amount_usd,
          rate: affiliate.rate,
          status: affiliate.status,
          title: affiliate.title,
          createdAt: (affiliate.time ?? 0) * 1000,
          affiliateType: 'WEEKLY-COMMISSION',
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
        console.log('Commission Affiliate table is locked');
        return;
      } else {
        console.log('---start migration commission affiliate---');
        const unmigrations = await this.migrationFailedRepo.find({
          where: {model: this.model},
        });
        unmigrations.map(async affiliate => {
          try {
            const _affiliate = await axios.post(this.url, {
              affiliate: {
                id: affiliate._id,
                investId: affiliate.invest_id,
                username: affiliate.user_name,
                week: affiliate.week,
                month: affiliate.month,
                year: affiliate.year,
                type: affiliate.type,
                iType: affiliate.i_type,
                pgv: affiliate.pgv,
                pgvPercent: affiliate.pgv_percent,
                package: affiliate.package_name,
                note: affiliate.note,
                desc: affiliate.desc,
                amount: affiliate.amount,
                amountUsd: affiliate.amount_usd,
                rate: affiliate.rate,
                status: affiliate.status,
                title: affiliate.title,
                createdAt: (affiliate.time ?? 0) * 1000,
                affiliateType: 'WEEKLY-COMMISSION',
              },
            });
            if (
              _affiliate.data.statusCode === 200 ||
              _affiliate.data.code === 11000
            ) {
              await this.migrationFailedRepo.deleteById(affiliate._id);
              console.log(`done error affiliate: ${affiliate._id}`);
            } else {
              console.log(`done error commission affiliate: ${affiliate._id}`);
            }
          } catch (error) {
            console.log(
              'error commission affiliate again:',
              affiliate._id,
              error,
            );
          }
        });

        this.totalMigrated = found.totalMigrated ?? 0;
        const affiliates = await this.commissionAffiliateRepo.find({
          skip: this.totalMigrated,
          limit: this.limit,
        });
        affiliates.map(async affiliate => {
          try {
            const _affiliate = await axios.post(this.url, {
              affiliate: {
                id: affiliate._id,
                investId: affiliate.invest_id,
                username: affiliate.user_name,
                week: affiliate.week,
                month: affiliate.month,
                year: affiliate.year,
                type: affiliate.type,
                iType: affiliate.i_type,
                pgv: affiliate.pgv,
                pgvPercent: affiliate.pgv_percent,
                package: affiliate.package_name,
                note: affiliate.note,
                desc: affiliate.desc,
                amount: affiliate.amount,
                amountUsd: affiliate.amount_usd,
                rate: affiliate.rate,
                status: affiliate.status,
                title: affiliate.title,
                createdAt: (affiliate.time ?? 0) * 1000,
                affiliateType: 'WEEKLY-COMMISSION',
              },
            });
            if (_affiliate.data.statusCode === 200) {
              console.log('done commission affiliate:', affiliate._id);
            } else {
              console.log(
                'commission affiliate error something:',
                _affiliate.data.statusCode,
              );
              await this.migrationFailedRepo.create({
                model: this.model,
                errorCode: _affiliate.data.statusCode,
                ...affiliate,
              });
            }
          } catch (error) {
            console.log('error commission affiliate:', affiliate._id);
            await this.migrationFailedRepo.create({
              model: this.model,
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
