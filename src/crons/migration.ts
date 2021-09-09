import { inject } from '@loopback/core';
import {CronJob, cronJob } from '@loopback/cron';
import { KeyBindings } from '../keys';
import { MigrationService } from '../services';

@cronJob()
export class MigrationCronJob extends CronJob {
  constructor(
    @inject(KeyBindings.MIGRATION_SERVICE)
    public migrationService: MigrationService
  ) {
    super({
      name: 'job-A',
      cronTime: '*/10 * * * * *',
      onTick: async () => {
        await this.migrationService.users()
      },
      start: true,
    });
    this.migrationService.init()
    .then(() => console.log('Migration initilized successfully!'))
    .catch(err => console.log('Migration initilized failed!', err))
  }
}