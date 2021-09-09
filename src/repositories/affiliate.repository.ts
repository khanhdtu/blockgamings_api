import { inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { MongodbDataSource } from '../datasources';
import { Affiliate, AffiliateRelations } from '../models';

export class AffiliateRepository extends DefaultCrudRepository<
  Affiliate,
  typeof Affiliate.prototype.id,
  AffiliateRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Affiliate, dataSource);
  }
}
