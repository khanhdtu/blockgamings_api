import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/mongodb.datasource';
import {AffiliateCommission, AffilicateCommissionRelations} from '../models';

export class AffilicateCommissionRepository extends DefaultCrudRepository<
  AffiliateCommission,
  typeof AffiliateCommission.prototype._id,
  AffilicateCommissionRelations
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(AffiliateCommission, dataSource);
  }
}
