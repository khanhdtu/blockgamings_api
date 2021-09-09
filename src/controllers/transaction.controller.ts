import { inject } from '@loopback/core';
import { Filter, repository } from '@loopback/repository';
import { getModelSchemaRef, post, get, requestBody, RestBindings, Request, param } from '@loopback/rest';
import { KeyBindings } from '../keys';
import { IArgsTransactionRequest, IResponse, IResponseList } from '../interfaces';
import { Bet, Transaction } from '../models';
import { TransactionRepository } from '../repositories';
import { author, TransactionService } from '../services';
import { parsingRequestCtx } from '../utils';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { groupBy } from 'lodash';

export class TransactionController {
  constructor(
    @repository(TransactionRepository)
    public transactionRepository: TransactionRepository,

    @inject(RestBindings.Http.REQUEST)
    private reqCtx: Request,

    @inject(KeyBindings.TRANSACTION_SERVICE)
    private transactionService: TransactionService
  ) {}

  @post('/payment/transactions')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  async findTransactions(
    @requestBody() args: IArgsTransactionRequest
  ) {
    try {
      // const { id } = parsingRequestCtx(this.reqCtx)
      return await this.transactionService.getTransactions(args)
    } catch (error) {
      return error
    }
  }

  @post('/payment/withdrawal')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  async createWithDrawal(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transaction, {exclude: ['type', 'code', 'userId', 'username', 'payment', 'amountUsdt']})
        },
      },
    }) transaction: Omit<Transaction, 'id'>
  ) {
    try {
      const { id, username } = parsingRequestCtx(this.reqCtx)
      return await this.transactionService.createWithdrawal({...transaction, userId: id ?? '', username })
    } catch (error) {
      return error
    }
  }

  @post('/payment/withdrawal/confirm')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  async confirmWithDrawal(
    @requestBody() args: {transactionId: string, approved: boolean}
  ) {
    try {
      // parsingRequestCtx(this.reqCtx)
      const { transactionId, approved } = args
      return await this.transactionService.confirmWithdrawal(transactionId, approved)
    } catch (error) {
      return error
    }
  }

  @post('/payment/deposit')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  async createDeposit(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transaction, {exclude: ['type', 'code', 'userId', 'username', 'payment', 'amountUsdt']})
        },
      },
    }) transaction: Omit<Transaction, 'id'>
  ) {
    try {
      const { id, username } = parsingRequestCtx(this.reqCtx)
      return await this.transactionService.createDeposit({...transaction, userId: id ?? '', username })
    } catch (error) {
      return error
    }
  }

  @post('/payment/transfer')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  async createTransfer(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transaction, {exclude: ['type', 'code', 'userId', 'username', 'payment', 'amountUsdt', 'coinCode']})
        },
      },
    }) transaction: Omit<Transaction, 'id'>
  ) {
    try {
      const { id, username } = parsingRequestCtx(this.reqCtx)
      return await this.transactionService.createTransfer({...transaction, userId: id ?? '', username })
    } catch (error) {
      return error
    }
  }

  @post('/payment/convert')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  async createConvert(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transaction, {exclude: ['type', 'code', 'userId', 'username', 'payment', 'amountUsdt']})
        },
      },
    }) transaction: Omit<Transaction, 'id'>
  ) {
    try {
      const { id, username } = parsingRequestCtx(this.reqCtx)
      return await this.transactionService.createTransfer({...transaction, userId: id ?? '', username })
    } catch (error) {
      return error
    }
  }

  @post('/payment/bets')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  async getBets(
    @param.filter(Bet) filter: Filter,
    @requestBody() args: IArgsTransactionRequest
  ) {
    try {
      return await this.transactionService.getBets(args, filter)
    } catch (error) {
      return error
    }
  }

  @get('/payment/bets/winners')
  async dashboardBets(): Promise<IResponseList<{}>> {
    try {
      return await this.transactionService.betWinners()
    } catch (error) {
      return error
    }
  }

  @get('/payment/bets/monthly-profits')
  async monthlyProfits() {
    try {
      return await this.transactionService.getMonthlyProfits()
    } catch (error) {
      return error
    }
  }
}
