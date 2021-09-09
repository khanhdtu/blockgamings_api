import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/mongodb.datasource';
import {Transfer, TransferRelations} from '../models';

export class TransferRepository extends DefaultCrudRepository<
  Transfer,
  typeof Transfer.prototype._id,
  TransferRelations
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(Transfer, dataSource);
  }
}
