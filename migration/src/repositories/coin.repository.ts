import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/mongodb.datasource';
import {Coin, CoinRelations} from '../models';

export class CoinRepository extends DefaultCrudRepository<
Coin,
  typeof Coin.prototype._id,
  CoinRelations
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(Coin, dataSource);
  }
}
