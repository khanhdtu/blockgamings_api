import {DefaultCrudRepository} from '@loopback/repository';
import {Migration, MigrationRelations} from '../models';
import {MongodbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class MigrationRepository extends DefaultCrudRepository<
  Migration,
  typeof Migration.prototype.id,
  MigrationRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Migration, dataSource);
  }
}
