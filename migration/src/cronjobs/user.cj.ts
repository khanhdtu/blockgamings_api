import {inject} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {KeyBindings} from '../keys';
import {UserService} from '../services';

@cronJob()
export class UserMigrationCronJob extends CronJob {
  constructor(
    @inject(KeyBindings.USER_MIGRATION_SERVICE)
    public userService: UserService,
  ) {
    super({
      name: 'job-user-migration',
      cronTime: '*/20 * * * * *',
      onTick: async () => {
        // await this.userService.newUsers();
        await this.userService.migrate();
      },
      start: true,
    });

    this.userService
      .init()
      .then(() => {
        console.log('Initialized CUSTOMER migration successfully');
      })
      .catch(err => {
        console.log('Initialized CUSTOMER migration failed', err);
      });
  }
}
