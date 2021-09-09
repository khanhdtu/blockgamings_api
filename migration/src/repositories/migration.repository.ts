import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/mongodb.datasource';
import {Migration, MigrationRelations} from '../models';

export class MigrationRepository extends DefaultCrudRepository<
  Migration,
  typeof Migration.prototype.id,
  MigrationRelations
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(Migration, dataSource);
  }
}
