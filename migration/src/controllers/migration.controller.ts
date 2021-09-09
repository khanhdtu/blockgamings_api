/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {del, get, post, put, requestBody} from '@loopback/rest';
import {KeyBindings} from '../keys';
import {
  AddressRepository,
  AffilicateCommissionRepository,
  AffilicateWeeklyRepository,
  CustomerRepository,
  DepositRepository,
  GameHistoryRepository,
  MigrationFailedRepository,
  MigrationRepository,
  TransferRepository,
  WalletRepository,
  WithdrawalRepository
} from '../repositories';
import {
  AddressService,
  CommissionAffiliateService,
  DepositService,
  TransferService,
  UserService,
  WalletService,
  WeeklyAffiliateService,
  WithdrawService
} from '../services';
import axios from 'axios';

export class CustomerController {
  url = process.env.MIGRATION_URL;
  constructor(
    @repository(CustomerRepository)
    public customerRepository: CustomerRepository,

    @repository(WalletRepository)
    public walletRepository: WalletRepository,

    @repository(AddressRepository)
    public addressRepository: AddressRepository,

    @repository(DepositRepository)
    public depositRepository: DepositRepository,

    @repository(TransferRepository)
    public transferRepository: TransferRepository,

    @repository(WithdrawalRepository)
    public withdrawalRepository: WithdrawalRepository,

    @repository(GameHistoryRepository)
    public gameHistoryRepository: GameHistoryRepository,

    @repository(AffilicateCommissionRepository)
    public affiliateComissionRepository: AffilicateCommissionRepository,

    @repository(AffilicateWeeklyRepository)
    public affiliateWeeklyRepository: AffilicateWeeklyRepository,

    @repository(MigrationRepository)
    public migrationRepo: MigrationRepository,

    @repository(MigrationFailedRepository)
    public migrationFailedRepo: MigrationFailedRepository,

    @inject(KeyBindings.USER_MIGRATION_SERVICE)
    public userService: UserService,

    @inject(KeyBindings.ADDRESS_MIGRATION_SERVICE)
    public addressService: AddressService,

    @inject(KeyBindings.WALLET_MIGRATION_SERVICE)
    public walletService: WalletService,

    @inject(KeyBindings.DEPOSIT_MIGRATION_SERVICE)
    public depositService: DepositService,

    @inject(KeyBindings.TRANSFER_MIGRATION_SERVICE)
    public transferService: TransferService,

    @inject(KeyBindings.WITHDRAW_MIGRATION_SERVICE)
    public withdrawService: WithdrawService,

    @inject(KeyBindings.COMMISSION_AFFILIATE_MIGRATION_SERVICE)
    public commissionAffiliateService: CommissionAffiliateService,

    @inject(KeyBindings.WEEKLY_AFFILIATE_MIGRATION_SERVICE)
    public volumeAffiliateService: WeeklyAffiliateService,
  ) {}

  @get('/customers')
  async findCustomers() {
    try {
      return await this.customerRepository.find();
    } catch (error) {
      return error;
    }
  }

  @put('/customers/reset')
  async resetCustomers() {
    try {
      const userRepoFound = await this.migrationRepo.findOne({
        where: { model: 'user' }
      })
      await this.migrationRepo.updateById(userRepoFound?.id, {
        totalMigrated: 0
      })
      return 'ok'
    } catch (error) {
      return error;
    }
  }

  @get('/wallets')
  async findWallets() {
    try {
      return await this.walletRepository.find();
    } catch (error) {
      return error;
    }
  }

  @get('/addresses')
  async findAddresses() {
    try {
      return await this.addressRepository.find();
    } catch (error) {
      return error;
    }
  }

  @get('/deposits')
  async findDeposits() {
    try {
      return await this.depositRepository.find();
    } catch (error) {
      return error;
    }
  }

  @get('/transfers')
  async findTransfers() {
    try {
      return await this.transferRepository.find();
    } catch (error) {
      return error;
    }
  }

  @get('/withdrawals')
  async findWithdrawals() {
    try {
      return await this.withdrawalRepository.find();
    } catch (error) {
      return error;
    }
  }

  @get('/livebets') // game histories
  async findLiveBets() {
    try {
      const step = 50000;
      const skip = 0;
      const bets = await this.gameHistoryRepository.find({
        limit: step,
        skip: step * skip,
      });
      const betsV2: any[] = [];
      bets.map(bet => {
        betsV2.push({
          id: bet._id,
          username: bet.user_name,
          type: bet.type,
          balance: bet.balance,
          amount: bet.amount,
          currency: bet.currency,
          gameId: bet.i_gameid ?? '',
          system: bet.system,
          refunded: bet.refunded,
          createdAt: (bet.time ?? 0) * 1000,
        });
      });
      return betsV2;
    } catch (error) {
      return error;
    }
  }

  @get('/lastest-livebets')
  async findLastestLivebets() {
    try {
      return await this.gameHistoryRepository.find({
        order: ['time DESC'],
        limit: 10,
        // where: {
        //   time: {
        //     between: [1623099139, 1623099139 + 60],
        //   },
        // },
      });
    } catch (error) {
      return error;
    }
  }

  @get('/affiliate-weekly')
  async weeklyAffiliates() {
    try {
      return await this.affiliateWeeklyRepository.find();
    } catch (error) {
      return error;
    }
  }

  @get('/affiliate-commission')
  async weeklyCommissions() {
    try {
      return await this.affiliateComissionRepository.find();
    } catch (error) {
      return error;
    }
  }

  @post('/migration/once/users')
  async migrateAllUsers() {
    try {
      return await this.userService.migrateAll();
    } catch (error) {
      return error;
    }
  }

  @post('/migration/once/address')
  async migrateAllAdresses() {
    try {
      return await this.addressService.migrateAll();
    } catch (error) {
      return error;
    }
  }

  @post('/migration/once/wallets')
  async migrateAllWallets() {
    try {
      return await this.walletService.migrateAll();
    } catch (error) {
      return error;
    }
  }

  @post('/migration/once/deposits')
  async migrateAllDesposits() {
    try {
      return await this.depositService.migrateAll();
    } catch (error) {
      return error;
    }
  }

  @post('/migration/once/transfers')
  async migrateAllTransfers() {
    try {
      return await this.transferService.migrateAll();
    } catch (error) {
      return error;
    }
  }

  @post('/migration/once/withdraws')
  async migrateAllWithdraws() {
    try {
      return await this.withdrawService.migrateAll();
    } catch (error) {
      return error;
    }
  }

  @post('migration/once/volume-affiliates')
  async migrateAllVolumeAffiliates() {
    try {
      return await this.volumeAffiliateService.migrateAll();
    } catch (error) {
      return error;
    }
  }

  @post('migration/once/commission-affiliates')
  async migrateAllCommissionAffiliates() {
    try {
      return await this.commissionAffiliateService.migrateAll();
    } catch (error) {
      return error;
    }
  }

  @del('migration/clean-up')
  async cleanUp() {
    try {
      await this.migrationRepo.deleteAll();
      await this.migrationFailedRepo.deleteAll();
      return 'OK';
    } catch (error) {
      return error;
    }
  }

  @post('migration/wallet/deposit')
  async walletDeposit(
    @requestBody() deposit: { username: string, amount: number }
  ) {
    try {
      const walletFound = await this.walletRepository.findOne({
        where: {
          user_name: deposit.username,
          coin: 'usd'
        }
      })
      await this.walletRepository.updateById(walletFound?._id, {
        balance: (walletFound?.balance ?? 0) + (deposit?.amount ?? 0)
      })
      return {
        statusCode: 200,
      }
    } catch (error) {
      return error
    }
  }

  // OK
  @put('migration/users/pass-x')
  async passX() {
    try {
      const users = await this.customerRepository.find()
      users.map(async user => {
        await axios.put('http://localhost:8800/migration/users/pass-x', {
          user: {
            id: user._id,
            username: user.UserName,
            password: user.Password
          }
        })
      })
      return 'ok'
    } catch (error) {
      return error
    }
  }

  @put('migration/users/password-sync')
  async passwordSync(
    @requestBody() { id, password }: { id: string, password: string }
  ) {
    try {
      await this.customerRepository.updateById(id, { Password: password })
      return {
        statusCode: 200,
        data: id
      }
    } catch (error) {
      return error
    }
  }
}
