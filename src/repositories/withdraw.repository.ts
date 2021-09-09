import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Withdraw, WithdrawRelations} from '../models';

export class WithdrawRepository extends DefaultCrudRepository<
  Withdraw,
  typeof Withdraw.prototype.id,
  WithdrawRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Withdraw, dataSource);
  }
}
