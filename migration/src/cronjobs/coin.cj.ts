import {inject} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {KeyBindings} from '../keys';
import {CoinService} from '../services';

@cronJob()
export class CoinMigrationCronJob extends CronJob {
  constructor(
    @inject(KeyBindings.COIN_MIGRATION_SERVICE)
    public coinService: CoinService,
  ) {
    super({
      name: 'job-coin-migration',
      cronTime: '*/10 * * * * *',
      onTick: async () => {
        // await this.addressService.newAddresses();
        await this.coinService.migrate();
      },
      start: true,
    });

    this.coinService
      .init()
      .then(() => {
        console.log('Initialized COIN migration successfully');
      })
      .catch(err => {
        console.log('COIN migration failed', err);
      });
  }
}
