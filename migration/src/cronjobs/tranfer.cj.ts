import {inject} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {KeyBindings} from '../keys';
import {TransferService} from '../services';

@cronJob()
export class TransferMigrationCronJob extends CronJob {
  constructor(
    @inject(KeyBindings.TRANSFER_MIGRATION_SERVICE)
    public transferService: TransferService,
  ) {
    super({
      name: 'job-transfer-migration',
      cronTime: '*/60 * * * * *',
      onTick: async () => {
        // await this.transferService.newTransfers();
        await this.transferService.migrate();
      },
      start: true,
    });

    this.transferService
      .init()
      .then(() => {
        console.log('Initialized TRANSFER migration successfully');
      })
      .catch(err => {
        console.log('Initialized TRANSFER migration failed', err);
      });
  }
}
