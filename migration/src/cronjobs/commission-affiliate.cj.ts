import {inject} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {KeyBindings} from '../keys';
import {CommissionAffiliateService} from '../services';

@cronJob()
export class CommissionAffiliateMigrationCronJob extends CronJob {
  constructor(
    @inject(KeyBindings.COMMISSION_AFFILIATE_MIGRATION_SERVICE)
    public commissionAffiliateService: CommissionAffiliateService,
  ) {
    super({
      name: 'job-commission-affiliate-migration',
      cronTime: '*/70 * * * * *',
      onTick: async () => {
        await this.commissionAffiliateService.migrate();
        // await this.commissionAffiliateService.newCommissionAffiliates();
      },
      start: true,
    });

    this.commissionAffiliateService
      .init()
      .then(() => {
        console.log('Initialized COMMISSION AFFILIATE migration successfully');
      })
      .catch(err => {
        console.log('Initialized COMMISSION AFFILIATE migration failed', err);
      });
  }
}
