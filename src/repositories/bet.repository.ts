import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Bet, BetRelations} from '../models';

export class BetRepository extends DefaultCrudRepository<
  Bet,
  typeof Bet.prototype.id,
  BetRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Bet, dataSource);
  }
}
