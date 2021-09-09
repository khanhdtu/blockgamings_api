import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/mongodb.datasource';
import {Wallet, WalletRelations} from '../models';

export class WalletRepository extends DefaultCrudRepository<
  Wallet,
  typeof Wallet.prototype._id,
  WalletRelations
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(Wallet, dataSource);
  }
}
