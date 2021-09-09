import {inject} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {KeyBindings} from '../keys';
import {DepositService} from '../services';

@cronJob()
export class DepositMigrationCronJob extends CronJob {
  constructor(
    @inject(KeyBindings.DEPOSIT_MIGRATION_SERVICE)
    public depositService: DepositService,
  ) {
    super({
      name: 'job-deposit-migration',
      cronTime: '*/70 * * * * *',
      onTick: async () => {
        // await this.depositService.newDeposits();
        await this.depositService.migrate();
      },
      start: true,
    });

    this.depositService
      .init()
      .then(() => {
        console.log('Initialized DEPOSIT migration successfully');
      })
      .catch(err => {
        console.log('DEPOSIT migration failed', err);
      });
  }
}
