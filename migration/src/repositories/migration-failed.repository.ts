import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/mongodb.datasource';
import {MigrationFailed, MigrationFailedRelations} from '../models';

export class MigrationFailedRepository extends DefaultCrudRepository<
  MigrationFailed,
  typeof MigrationFailed.prototype.id,
  MigrationFailedRelations
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(MigrationFailed, dataSource);
  }
}
