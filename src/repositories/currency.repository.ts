import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Currency, CurrencyRelations} from '../models';

export class CurrencyRepository extends DefaultCrudRepository<
  Currency,
  typeof Currency.prototype.id,
  CurrencyRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Currency, dataSource);
  }
}
