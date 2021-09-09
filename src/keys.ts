import {UserService} from '@loopback/authentication';
import {BindingKey} from '@loopback/context';
import {User} from './models';
import {Credentials} from './repositories';
import {UsersService, AffiliateService, CurrencyService, TransactionService, DepositService, WithdrawService, TransferService, MigrationService} from './services';
import {EmailService} from './services/email.service';

export namespace KeyBindings {
  export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>(
    'services.UserManagementService',
  );
  export const USERS_SERVICE = BindingKey.create<UsersService>(
    'services.UsersService',
  );
  export const EMAIL_SERVICE = BindingKey.create<EmailService>(
    'services.EmailService',
  );
  export const AFFILIATE_SERVICE = BindingKey.create<AffiliateService>(
    'services.AffiliateService',
  );
  export const CURRENCY_SERVICE = BindingKey.create<CurrencyService>(
    'services.CurrencyService',
  );
  export const TRANSACTION_SERVICE = BindingKey.create<TransactionService>(
    'services.TransactionService',
  );
  export const DEPOSIT_SERVICE = BindingKey.create<DepositService>(
    'services.DepositService',
  );
  export const WITHDRAW_SERVICE = BindingKey.create<WithdrawService>(
    'services.WithdrawService',
  );
  export const TRANSFER_SERVICE = BindingKey.create<TransferService>(
    'services.TransferService',
  );
  export const MIGRATION_SERVICE = BindingKey.create<MigrationService>(
    'services.MigrationService',
  );
}
