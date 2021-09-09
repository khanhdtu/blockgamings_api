import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/mongodb.datasource';
import {Deposit, DepositRelations} from '../models';

export class DepositRepository extends DefaultCrudRepository<
  Deposit,
  typeof Deposit.prototype._id,
  DepositRelations
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(Deposit, dataSource);
  }
}
