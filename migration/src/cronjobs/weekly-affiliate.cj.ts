import {inject} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {KeyBindings} from '../keys';
import {WeeklyAffiliateService} from '../services';

@cronJob()
export class WeeklyAffiliateMigrationCronJob extends CronJob {
  constructor(
    @inject(KeyBindings.WEEKLY_AFFILIATE_MIGRATION_SERVICE)
    public weeklyAffiliateService: WeeklyAffiliateService,
  ) {
    super({
      name: 'job-weekly-affiliate-migration',
      cronTime: '*/70 * * * * *',
      onTick: async () => {
        // await this.weeklyAffiliateService.newWeeklyAffiliates();
        await this.weeklyAffiliateService.migrate();
      },
      start: true,
    });

    this.weeklyAffiliateService
      .init()
      .then(() => {
        console.log('Initialized WEEKLY AFFILIATE migration successfully');
      })
      .catch(err => {
        console.log('Initialized WEEKLY AFFILIATE migration failed', err);
      });
  }
}
