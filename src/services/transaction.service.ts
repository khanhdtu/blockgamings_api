import {injectable, BindingScope} from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { MESSAGE } from '../constants';
import { IArgsTransactionRequest, IResponse, IResponseList } from '../interfaces';
import { Transaction } from '../models';
import { BetRepository, TransactionRepository, WalletRepository } from '../repositories';
import { groupBy } from 'lodash';

@injectable({scope: BindingScope.TRANSIENT})
export class TransactionService {
  constructor(
    @repository(TransactionRepository)
    private transactionRepository: TransactionRepository,

    @repository(WalletRepository)
    private walletRepository: WalletRepository,

    @repository(BetRepository)
    private betRepository: BetRepository
  ) {}

  async getTransactions(args: IArgsTransactionRequest): Promise<IResponse<Transaction[]>> {
    const transactions = await this.transactionRepository.find({
      where: {
        // type: args.type,
        status: args.status,
        coinCode: args.coinCode,
        username: args.keyWord && { like: args.keyWord },
        createdAt: {
          between: [args.dateFrom ?? 0, args.dateTo ?? new Date().getTime()]
        }
      },
      order: ['createdAt DESC']
    })
    return {
      statusCode: 200,
      data: transactions
    }
  }

  async createWithdrawal(transaction: Transaction): Promise<IResponse<Transaction>> {
    const withDrawal = new Transaction({
      ...transaction,
      type: 'WITHDRAWAL',
      code: 'x_IT1616075478589-1620785592',
      tokenCode: 'x_1616075478589',
      txid: 'x_CWFE2AJKILTOX9HDPNWFJOHA9R',
      amountUsdt: transaction.amount,
      status: transaction.amount > 3000 ? 'PENDING' : 'PROCESSING',
      createdAt: new Date().getTime()
    })
    await this.transactionRepository.create(withDrawal)
    return {
      statusCode: 200,
      message: MESSAGE.PAYMENT_WITHDRAWAL_SUCCESS,
      data: withDrawal
    }
  }

  async confirmWithdrawal(transactionId: string, approved: boolean): Promise<IResponse<Transaction>> {
    const transaction = await this.transactionRepository.findOne({
      where: {id: transactionId, status: 'PENDING'}
    })
    if (!transaction) throw new HttpErrors[404](MESSAGE.PAYMENT_WITHDRAWAL_NOT_FOUND)
    const status = approved ? 'PROCESSING' : 'CANCELED'
    await this.transactionRepository.updateById(transaction?.id ?? '', { status })
    transaction.status = status
    return {
      statusCode: 200,
      message: MESSAGE.PAYMENT_WITHDRAWAL_CONFIRM_SUCCESS,
      data: transaction
    }
  }

  async createDeposit(transaction: Transaction): Promise<IResponse<Transaction>> {
    const deposit = new Transaction({
      ...transaction,
      type: 'DEPOSIT',
      code: 'x_IT1616075478589-1620785592',
      amountUsdt: transaction.amount,
      createdAt: new Date().getTime()
    })
    const userWallet = await this.walletRepository.findOne({
      where: {username: transaction.toUsername, coinCode: 'usd'}
    })
    if (!userWallet) {
      throw new HttpErrors[404](MESSAGE.PAYMENT_MAIN_WALLET_NOT_FOUND)
    }
    await this.walletRepository.updateById(userWallet?.id, {
      balance: (userWallet?.balance ?? 0) + deposit.amountUsdt
    })

    deposit.userId = userWallet.userId ?? '0'
    deposit.username = userWallet.username
    deposit.status = 'COMPLETED'
    await this.transactionRepository.create(deposit)

    return {
      statusCode: 200,
      message: MESSAGE.PAYMENT_DEPOSIT_SUCCESS,
      data: deposit
    }
  }

  async createTransfer(transaction: Transaction): Promise<IResponse<Transaction>> {
    const transfer = new Transaction({
      ...transaction,
      type: 'TRANSFER',
      coinCode: 'UDST',
      code: 'x_IT1616075478589-1620785592',
      amountUsdt: transaction.amount,
      createdAt: new Date().getTime()
    })
    await this.transactionRepository.create(transfer)
    return {
      statusCode: 200,
      message: MESSAGE.PAYMENT_TRANSFER_SUCCESS,
      data: transfer
    }
  }

  async createConvert(transaction: Transaction): Promise<IResponse<Transaction>> {
    const convert = new Transaction({
      ...transaction,
      type: 'CONVERT',
      code: 'x_IT1616075478589-1620785592',
      amountUsdt: transaction.amount,
      createdAt: new Date().getTime()
    })
    await this.transactionRepository.create(convert)
    return {
      statusCode: 200,
      message: MESSAGE.PAYMENT_CONVERT_SUCCESS,
      data: convert
    }
  }

  async getBets(args: IArgsTransactionRequest, filter = {}): Promise<IResponseList<{}>> {
    try {
      const list = await this.betRepository.find({
        where: {
          username: args.keyWord && { like: args.keyWord },
          createdAt: {
            between: [args.dateFrom ?? 0, args.dateTo ?? new Date().getTime()]
          }
        },
        order: ['createdAt DESC'],
        ...filter,
      })

      const { count } = await this.betRepository.count()

      return {
        statusCode: 200,
        data: { list, count }
      }
    } catch (error) {
      return error
    }
  }

  async getMonthlyProfits(): Promise<IResponse<{}>> {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      let totalCredit = 0;
      let totalDebit = 0;

      const bets = await this.betRepository.find({
        where: {
          createdAt: {
            gt: new Date(`${month}/1/${year}`).getTime()
          }
        }
      });

      const credits = bets.filter(bet => bet.type === 'credit');
      const debits = bets.filter(bet => bet.type === 'debit');

      credits.map(credit => totalCredit += credit.amount ?? 0);
      debits.map(debit => totalDebit += debit.amount ?? 0);

      return {
        statusCode: 200,
        data: {
          credit: totalCredit,
          debit: totalDebit,
          profit: totalCredit - totalDebit
        }
      }
    } catch (error) {
      return error
    }
  }

  async betWinners(): Promise<IResponseList<{}>> {
    try {
      // const lastWeek = new Date().getTime() - (7*24*60*60*1000)
      const list = await this.betRepository.find({
        limit: 3000,
        order: ['createdAt DESC']
      })
      const grouped = groupBy(list, 'username')
      const winners = [] as any[]
      Object.keys(grouped).map(key => {
        if (winners.length <= 10) {
          let totalBet = 0
          grouped[key].map(e => {
            if (e.type === 'credit') {
              totalBet += (e.amount ?? 0)
            } else {
              totalBet -= (e.amount ?? 0)
            }
          })
          winners.push({
            username: grouped[key][0].username,
            system: grouped[key][0].system,
            totalBet,
          })
        }
        return
      })
      return {
        statusCode: 200,
        data: {
          list: winners.sort((a,b) => b.totalBet - a.totalBet),
          count: winners.length,
        }
      }
    } catch (error) {
      return error
    }
  }
}
