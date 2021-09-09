import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/mongodb.datasource';
import {GameHistory, GameHistoryRelations} from '../models';

export class GameHistoryRepository extends DefaultCrudRepository<
  GameHistory,
  typeof GameHistory.prototype._id,
  GameHistoryRelations
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(GameHistory, dataSource);
  }
}
