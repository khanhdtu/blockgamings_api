import {BindingKey} from '@loopback/context';
import {
  CoinService,
  CommissionAffiliateService,
  GameHistoryService,
  TransferService,
  UserService,
  WalletService,
  WeeklyAffiliateService,
} from '../services';
import {AddressService} from '../services/address.service';
import {DepositService} from '../services/deposit.service';
import {WithdrawService} from '../services/withdraw.service';

export namespace KeyBindings {
  export const USER_MIGRATION_SERVICE = BindingKey.create<UserService>(
    'services.UserService',
  );
  export const WALLET_MIGRATION_SERVICE = BindingKey.create<WalletService>(
    'services.WalletService',
  );
  export const DEPOSIT_MIGRATION_SERVICE = BindingKey.create<DepositService>(
    'services.DepositService',
  );
  export const WITHDRAW_MIGRATION_SERVICE = BindingKey.create<WithdrawService>(
    'services.WithdrawService',
  );
  export const TRANSFER_MIGRATION_SERVICE = BindingKey.create<TransferService>(
    'services.TransferService',
  );
  export const WEEKLY_AFFILIATE_MIGRATION_SERVICE =
    BindingKey.create<WeeklyAffiliateService>(
      'services.WeeklyAffiliateService',
    );
  export const COMMISSION_AFFILIATE_MIGRATION_SERVICE =
    BindingKey.create<CommissionAffiliateService>(
      'services.CommissionAffiliateService',
    );
  export const GAME_HISTORY_MIGRATION_SERVICE =
    BindingKey.create<GameHistoryService>('services.GameHistoryService');
  export const ADDRESS_MIGRATION_SERVICE = BindingKey.create<AddressService>(
    'services.AddressService',
  );
  export const COIN_MIGRATION_SERVICE = BindingKey.create<CoinService>(
    'services.CoinService',
  );
}
