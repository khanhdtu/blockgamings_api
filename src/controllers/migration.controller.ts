import { repository } from '@loopback/repository';
import { post, get, del, put, requestBody } from '@loopback/rest';
import { encrypt } from '../utils';
import { AddressRepository, AffiliateRepository, BetRepository, CurrencyRepository, DepositRepository, TransactionRepository, TransferRepository, UserRepository, WalletRepository, WithdrawRepository } from '../repositories';
import dbLivebets from '../fixtures/livebets.json';
import dbAffiliateWeekly from '../fixtures/affiliateWeekly.json';
import { User } from '../models/user.model';
import { Wallet } from '../models/wallet.model';
import { Deposit } from '../models/deposit.model';
import { Transfer } from '../models/transfer.model';
import { Address, Affiliate, Bet, Currency, Withdraw } from '../models';
import axios from 'axios';

export class MigrationController {
  blockgamingsIP = process.env.BLOCKGAMINGS_IP;
  brandId = process.env.BRAND_ID;
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    @repository(WalletRepository)
    public walletRepository: WalletRepository,

    @repository(TransactionRepository)
    public transactionRepository: TransactionRepository,

    @repository(AddressRepository)
    public addressRepository: AddressRepository,

    @repository(BetRepository)
    public betRepository: BetRepository,

    @repository(DepositRepository)
    public depositRepository: DepositRepository,

    @repository(WithdrawRepository)
    public withdrawRepository: WithdrawRepository,

    @repository(TransferRepository)
    public transferRepository: TransferRepository,

    @repository(AffiliateRepository)
    public affiliateRepository: AffiliateRepository,

    @repository(CurrencyRepository)
    public currencyRepository: CurrencyRepository
  ) {}

  @get('migration/users')
  async users() {
    try {
      const users = await this.userRepository.find()
      return {
        statusCode: 200,
        data: users
      }
    } catch (error) {
      return error
    }
  }

  // OK
  @post('migration/users')
  async migrateNewUsers(
    @requestBody() {user}: { user: User }
  ) {
    try {
      await this.userRepository.create(user)
      return {
        statusCode: 200,
        // message: 'Migration is successful'
      }
    } catch (error) {
      return error
    }
  }

  // Did not use yet
  @put('migration/users')
  async migrateUsers(
    @requestBody() {user}: { user: User }
  ) {
    try {
      await this.userRepository.create({
        ...user,
      })
      return {
        statusCode: 200,
        // message: 'Migration is successful'
      }
    } catch (error) {
      return error
    }
  }

  // OK
  @post('migration/address')
  async migrateAddresses(
    @requestBody() {address}:{address: Address}
  ) {
    try {
      await this.addressRepository.create(address)
      return {
        statusCode: 200,
        // message: `${addresses.length} records of Address was migrated successfully!`
      }
    } catch (error) {
      return error
    }
  }

  // OK
  @post('migration/wallets')
  async migrateNewWallets(
    @requestBody() {wallet}:{wallet: Wallet}
  ) {
    try {
      // await this.walletRepository.deleteAll()
      await this.walletRepository.create(wallet)
      return {
        statusCode: 200,
        // message: `${wallets.length} records of Wallet was migrated successfully!`
      }
    } catch (error) {
      console.log('xxxx', error)
      return error
    }
  }

  // OK
  @put('migration/wallets')
  async migrateUpdatedWallets(
    @requestBody() {wallets}: {wallets: Wallet[]}
  ) {
    try {
      wallets.map(async wallet => {
        await this.walletRepository.updateById(wallet.id, {
          balance: wallet.balance,
          updatedAt: wallet.updatedAt,
        })
      })
      return {
        statusCode: 200,
        message: `${wallets.length} records of DEPOSIT was migrated successfully!`
      }
    } catch (error) {
      return error
    }
  }

  // OK
  @post('migration/deposits')
  async migrateDeposits(
    @requestBody() { deposit }: { deposit: Deposit }
  ) {
    try {
      await this.depositRepository.create(deposit)
      return {
        statusCode: 200,
        // message: `${deposits.length} records of DEPOSIT was migrated successfully!`
      }
    } catch (error) {
      return error
    }
  }

  // OK
  @post('migration/transfers')
  async migrateTransfers(
    @requestBody() { transfer } : { transfer: Transfer }
  ) {
    try {
      await this.transferRepository.create(transfer)
      return {
        statusCode: 200,
        // message: `${transfers.length} records of TRANSFER was migrated successfully!`
      }
    } catch (error) {
      return error
    }
  }

  // OK
  @post('migration/withdraws')
  async migrateWithdrawals(
    @requestBody() { withdraw } : { withdraw: Withdraw }
  ) {
    try {
      await this.withdrawRepository.create(withdraw)

      return {
        statusCode: 200,
        // message: `${withdraws.length} records of WITHDRAW was migrated successfully!`
      }
    } catch (error) {
      return error
    }
  }

  // OK
  @post('migration/game-history')
  async migrateLiveBets(
    @requestBody() { game }: { game : Bet }
  ) {
    try {
      await this.betRepository.create(game)
      // console.log(`Migrated ${livebets.length} of GAME HISTORY successully`)
      return {
        statusCode: 200,
        // message: `${livebets.length} records of LIVEBET was migrated successfully!`
      }
    } catch (error) {
      return error
    }
  }

  @post('migration/xyz')
  async migrateXYZ(
  ) {
    // const bets = await this.betRepository.find({ skip: 221328, limit: 999999, order: ['createdAt DESC'] })
    // const count = await this.betRepository.count()
    // return { bets, count, betLength: bets.length }
    const livebets = JSON.parse(JSON.stringify(dbLivebets)) as any[]
    livebets.map(async bet => {
      await this.betRepository.create(bet)
    })
    return livebets.length
  }

  // OK
  @post('migration/affiliates')
  async affiliate(
    @requestBody() { affiliate } : { affiliate: Affiliate }
  ) {
    try {
      await this.affiliateRepository.create(affiliate)
      return {
        statusCode: 200,
        // message: `${affiliates.length} records of Affiliate was migrated successfully!`
      }
    } catch (error) {
      return error
    }
  }

  // OK
  @post('migration/currency')
  async currency(
    @requestBody() { currency } : { currency: Currency }
  ) {
    try {
      await this.currencyRepository.create(currency)
      return {
        statusCode: 200,
        // message: `${affiliates.length} records of Affiliate was migrated successfully!`
      }
    } catch (error) {
      return error
    }
  }

  @post('migration/affiliate-weekly')
  async affiliateWeekly() {
    try {
      const affiliateWeekly = JSON.parse(JSON.stringify(dbAffiliateWeekly)) as any[]
      affiliateWeekly.map(async af => {
        await this.affiliateRepository.create({
          affiliateType: 'WEEKLY-VOLUME',
          username: af.user_name,
          week: af.week,
          month: af.month,
          year: af.year,
          casinoPv: af.casino_pv,
          casinoPgv: af.casino_pgv,
          casinoLevel: af.casino_level,
          createdAt: af.created_time * 1000,
        })
      })
      return {
        statusCode: 200,
        message: 'Migration is successful'
      }
    } catch (error) {
      return error
    }
  }

  // OK
  @del('migration/users')
  async deleteUsers() {
    try {
      const count = await this.userRepository.deleteAll()
      return {
        statusCode: 200,
        data: count
      }
    } catch (error) {
      return error
    }
  }

  // OK
  @del('migration/address')
  async deleteAddresses() {
    try {
      const count = await this.addressRepository.deleteAll()
      return {
        statusCode: 200,
        data: count
      }
    } catch (error) {
      return error
    }
  }

  // OK
  @del('migration/wallets')
  async deleteWallets() {
    try {
      const count = await this.walletRepository.deleteAll()
      return {
        statusCode: 200,
        data: count
      }
    } catch (error) {
      return error
    }
  }

  // OK
  @del('migration/deposits')
  async deleteDeposits() {
    try {
      const count = await this.depositRepository.deleteAll()
      return {
        statusCode: 200,
        data: count
      }
    } catch (error) {
      return error
    }
  }

  // OK
  @del('migration/transfers')
  async deleteTransfers() {
    try {
      const count = await this.transferRepository.deleteAll()
      return {
        statusCode: 200,
        data: count
      }
    } catch (error) {
      return error
    }
  }

  // OK
  @del('migration/withdraws')
  async deleteWithdraws() {
    try {
      const count = await this.withdrawRepository.deleteAll()
      return {
        statusCode: 200,
        data: count
      }
    } catch (error) {
      return error
    }
  }

  // OK
  @del('migration/affiliates')
  async deleteAffiliates() {
    try {
      const count = await this.affiliateRepository.deleteAll()
      return {
        statusCode: 200,
        data: count
      }
    } catch (error) {
      return error
    }
  }

  // OK
  @del('migration/live-bets')
  async deleteLiveBets () {
    const count = await this.betRepository.deleteAll()
    return count
  }

  // OK
  @put('migration/users/to-manager')
  async becomeManager(
    @requestBody() { username } : { username: string }
  ) {
    try {
      const userFound = await this.userRepository.findOne({
        where: { username }
      })
      await this.userRepository.updateById(userFound?.id, {
        role: 'ROLE_MANAGER'
      })
      console.log(this.blockgamingsIP)
      await axios.put(`${this.blockgamingsIP}/migration/users/to-manager`, {user: userFound, brandId: this.brandId})
      return {
        statusCode: 200,
        message: `${userFound?.fullName || userFound?.username} is manager now`
      }
    } catch (error) {
      return error
    }
  }

  @put('migration/users/pass-x')
  async passX(
    @requestBody() {user}: {user: User}
  ) {
    try {
      console.log(user.username)
      return await this.userRepository.updateById(user.id, {
        password: user.password
      })
    } catch (error) {
      return error
    }
  }

  getStatus (status: number, isRequest: boolean, isConfirmed: boolean) {
    if (status === 1) return 'COMPLETED'
    if (status === -1) return 'CANCLED'
    if (!isConfirmed) return 'PENDING'
    if (isRequest) return 'PROCESSING'
  }
}
