import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import {inject} from '@loopback/core';
import {
  post,
  param,
  requestBody,
} from '@loopback/rest';
import { Filter } from '@loopback/repository';
import { IArgsTransactionRequest } from '../interfaces';
import { KeyBindings } from '../keys';
import { author } from '../services/author.service';
import { TransferService } from '../services/transfer.service';
import { Transfer } from '../models';

export class TransferController {
  constructor(
    @inject(KeyBindings.TRANSFER_SERVICE)
    public transferService: TransferService
  ) {}

  @post('transfers')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  async search (
    @param.filter(Transfer) filter: Filter,
    @requestBody() args: IArgsTransactionRequest) {
    try {
      return await this.transferService.search(args, filter)
    } catch (error) {
      return error
    }
  }
}
