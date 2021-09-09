import {inject} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {KeyBindings} from '../keys';
import {AddressService} from '../services';

@cronJob()
export class AddressMigrationCronJob extends CronJob {
  constructor(
    @inject(KeyBindings.ADDRESS_MIGRATION_SERVICE)
    public addressService: AddressService,
  ) {
    super({
      name: 'job-address-migration',
      cronTime: '*/25 * * * * *',
      onTick: async () => {
        // await this.addressService.newAddresses();
        await this.addressService.migrate();
      },
      start: true,
    });

    this.addressService
      .init()
      .then(() => {
        console.log('Initialized ADDRESS migration successfully');
      })
      .catch(err => {
        console.log('ADDRESS migration failed', err);
      });
  }
}
