import { injectable, BindingScope} from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { MESSAGE } from '../constants';
import { IArgsTransactionRequest, IResponse, IResponseList } from '../interfaces';
import { Deposit } from '../models';
import { DepositRepository, WalletRepository } from '../repositories';
import axios from 'axios';

@injectable({scope: BindingScope.TRANSIENT})
export class DepositService {
  constructor(
    @repository(DepositRepository)
    public depositRepository: DepositRepository,

    @repository(WalletRepository)
    public walletRepository: WalletRepository,
  ) {}

  async search(args: IArgsTransactionRequest, filter = {}): Promise<IResponseList<Deposit>> {
    const list = await this.depositRepository.find({
      where: {
        coinCode: args.coinCode,
        username: args.keyWord && { like: args.keyWord },
        createdAt: {
          between: [args.dateFrom ?? 0, args.dateTo ?? new Date().getTime()]
        }
      },
      order: ['createdAt DESC'],
      ...filter,
    })

    const { count } = await this.depositRepository.count()

    return {
      statusCode: 200,
      data: { list, count }
    }
  }

  async createDeposit(deposit: Deposit): Promise<IResponse<Deposit>> {
    try {
      const newDeposit = new Deposit({
        ...deposit,
        amountUsdt: deposit.amount,
        createdAt: new Date().getTime()
      })
      const userWallet = await this.walletRepository.findOne({
        where: {username: deposit.username, coinCode: 'usd'}
      })
      if (!userWallet) {
        throw new HttpErrors[404](MESSAGE.PAYMENT_MAIN_WALLET_NOT_FOUND)
      }

      const res = await axios.post('http://localhost:8002/migration/wallet/deposit', {
        username: userWallet.username,
        amount: deposit.amount
      })

      if (res.data.statusCode === 200) {
        await this.walletRepository.updateById(userWallet?.id, {
          balance: (userWallet?.balance ?? 0) + (deposit?.amountUsdt ?? 0)
        })
        newDeposit.username = userWallet.username
        await this.depositRepository.create(newDeposit)
        return {
          statusCode: 200,
          message: MESSAGE.PAYMENT_DEPOSIT_SUCCESS,
          data: deposit
        }
      } else {
        return {
          statusCode: 500,
          data: deposit,
          message: MESSAGE.PAYMENT_DEPOSIT_ERROR
        }
      }
    } catch (error) {
      return error
    }
  }
}
