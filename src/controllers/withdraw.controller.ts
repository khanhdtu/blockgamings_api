import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import {inject} from '@loopback/core';
import { Filter } from '@loopback/repository';
import {
  param,
  post,
  requestBody,
} from '@loopback/rest';
import { IArgsTransactionRequest } from '../interfaces/transaction-args.interface';
import { KeyBindings } from '../keys';
import { Withdraw } from '../models';
import { author } from '../services/author.service';
import { WithdrawService } from '../services/withdraw.service';

export class WithdrawController {
  constructor(
    @inject(KeyBindings.WITHDRAW_SERVICE)
    public withdrawService: WithdrawService
  ) {}

  @post('withdraws')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  async search (
    @param.filter(Withdraw) filter: Filter,
    @requestBody() args: IArgsTransactionRequest) {
    try {
      return await this.withdrawService.search(args, filter)
    } catch (error) {
      return error
    }
  }
}
