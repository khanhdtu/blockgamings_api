import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import {inject} from '@loopback/core';
import {
  post,
  param,
  getModelSchemaRef,
  requestBody,
} from '@loopback/rest';
import { Filter } from '@loopback/repository';
import { IArgsTransactionRequest } from '../interfaces';
import { KeyBindings } from '../keys';
import { Deposit } from '../models/deposit.model';
import { author } from '../services/author.service';
import { DepositService } from '../services/deposit.service';

export class DepositController {
  constructor(
    @inject(KeyBindings.DEPOSIT_SERVICE)
    public depositService: DepositService
  ) {}

  @post('deposits')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  async search (
    @param.filter(Deposit) filter: Filter,
    @requestBody() args: IArgsTransactionRequest) {
    try {
      return await this.depositService.search(args, filter)
    } catch (error) {
      return error
    }
  }

  @post('deposit')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  async create (
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Deposit, {exclude: ['username', 'amountUsdt']})
        },
      },
    }) deposit: Omit<Deposit, 'id'>
  ) {
    try {
      return await this.depositService.createDeposit(deposit)
    } catch (error) {
      return error
    }
  }
}
