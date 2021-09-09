import {inject} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {KeyBindings} from '../keys';
import {WalletService} from '../services';

@cronJob()
export class WalletMigrationCronJob extends CronJob {
  constructor(
    @inject(KeyBindings.WALLET_MIGRATION_SERVICE)
    public walletService: WalletService,
  ) {
    super({
      name: 'job-wallet-migration',
      cronTime: '*/60 * * * * *',
      onTick: async () => {
        // await this.walletService.newWallets();
        // await this.walletService.updateWallets();
        await this.walletService.migrate();
      },
      start: true,
    });

    this.walletService
      .init()
      .then(() => {
        console.log('Initialized WALLET migration successfully');
      })
      .catch(err => {
        console.log('Initialized WALLET migration failed', err);
      });
  }
}
