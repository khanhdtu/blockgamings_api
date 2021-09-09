import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/mongodb.datasource';
import {Withdrawal, WithdrawalRelations} from '../models';

export class WithdrawalRepository extends DefaultCrudRepository<
  Withdrawal,
  typeof Withdrawal.prototype.id,
  WithdrawalRelations
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(Withdrawal, dataSource);
  }
}
