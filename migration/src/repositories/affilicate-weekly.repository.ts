import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/mongodb.datasource';
import {AffilicateWeekly, AffilicateWeeklyRelations} from '../models';

export class AffilicateWeeklyRepository extends DefaultCrudRepository<
  AffilicateWeekly,
  typeof AffilicateWeekly.prototype._id,
  AffilicateWeeklyRelations
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(AffilicateWeekly, dataSource);
  }
}
