import { injectable, BindingScope} from '@loopback/core';
import { repository } from '@loopback/repository';
import { IArgsTransactionRequest, IResponseList } from '../interfaces';
import { Withdraw } from '../models';
import { WithdrawRepository } from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class WithdrawService {
  constructor(
    @repository(WithdrawRepository)
    public withdrawRepository: WithdrawRepository
  ) {}

  async search(args: IArgsTransactionRequest, filter = {}): Promise<IResponseList<Withdraw>> {
    try {
      const list = await this.withdrawRepository.find({
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

      const { count } = await this.withdrawRepository.count()

      return {
        statusCode: 200,
        data: { list, count }
      }
    } catch (error) {
      return error
    }
  }
}
