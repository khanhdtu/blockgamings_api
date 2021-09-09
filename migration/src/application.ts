import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, createBindingFromClass} from '@loopback/core';
import {CronComponent} from '@loopback/cron';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import env from 'dotenv';
import path from 'path';
import {
  AddressMigrationCronJob,
  CoinMigrationCronJob,
  GameHistoryMigrationCronJob,
  UserMigrationCronJob,
  WeeklyAffiliateMigrationCronJob,
} from './cronjobs';
import {CommissionAffiliateMigrationCronJob} from './cronjobs/commission-affiliate.cj';
import {DepositMigrationCronJob} from './cronjobs/deposit.cj';
import {TransferMigrationCronJob} from './cronjobs/tranfer.cj';
import {WalletMigrationCronJob} from './cronjobs/wallet.cj';
import {WithdrawMigrationCronJob} from './cronjobs/withdraw.cj';
import {MySequence} from './sequence';

export {ApplicationConfig};

export class MigrationApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    env.config();

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);
    this.component(CronComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    // Start cronjobs
    this.add(createBindingFromClass(UserMigrationCronJob));
    this.add(createBindingFromClass(WalletMigrationCronJob));
    this.add(createBindingFromClass(DepositMigrationCronJob));
    this.add(createBindingFromClass(WithdrawMigrationCronJob));
    this.add(createBindingFromClass(TransferMigrationCronJob));
    this.add(createBindingFromClass(WeeklyAffiliateMigrationCronJob));
    this.add(createBindingFromClass(CommissionAffiliateMigrationCronJob));
    this.add(createBindingFromClass(GameHistoryMigrationCronJob));
    this.add(createBindingFromClass(AddressMigrationCronJob));
    this.add(createBindingFromClass(CoinMigrationCronJob));
  }
}
