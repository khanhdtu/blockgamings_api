import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Wallet, WalletRelations} from '../models';

export class WalletRepository extends DefaultCrudRepository<
  Wallet,
  typeof Wallet.prototype.id,
  WalletRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Wallet, dataSource);
  }
}
