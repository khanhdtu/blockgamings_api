import {inject} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {KeyBindings} from '../keys';
import {WithdrawService} from '../services';

@cronJob()
export class WithdrawMigrationCronJob extends CronJob {
  constructor(
    @inject(KeyBindings.WITHDRAW_MIGRATION_SERVICE)
    public withdrawService: WithdrawService,
  ) {
    super({
      name: 'job-withdraw-migration',
      cronTime: '*/50 * * * * *',
      onTick: async () => {
        // await this.withdrawService.newWithdraws();
        await this.withdrawService.migrate();
      },
      start: true,
    });

    this.withdrawService
      .init()
      .then(() => {
        console.log('Initialized WITHDRAW migration successfully');
      })
      .catch(err => {
        console.log('Initialized WITHDRAW migration failed', err);
      });
  }
}
