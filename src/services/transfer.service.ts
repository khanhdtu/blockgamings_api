import { injectable, BindingScope} from '@loopback/core';
import { repository } from '@loopback/repository';
import { IArgsTransactionRequest, IResponse, IResponseList } from '../interfaces';
import { Transfer } from '../models';
import { TransferRepository } from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class TransferService {
  constructor(
    @repository(TransferRepository)
    public transferRepository: TransferRepository
  ) {}

  async search(args: IArgsTransactionRequest, filter = {}): Promise<IResponseList<Transfer>> {
    try {
      const list = await this.transferRepository.find({
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

      const { count } = await this.transferRepository.count()

      return {
        statusCode: 200,
        data: { list, count }
      }
    } catch (error) {
      return error
    }
  }
}
