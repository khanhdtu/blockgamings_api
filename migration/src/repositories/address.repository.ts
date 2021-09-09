import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/mongodb.datasource';
import {Address, AddressRelations} from '../models';

export class AddressRepository extends DefaultCrudRepository<
  Address,
  typeof Address.prototype._id,
  AddressRelations
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(Address, dataSource);
  }
}
