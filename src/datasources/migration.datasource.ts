import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
const config = {
  name: 'mongodb',
  connector: 'mongodb',
  url: 'localhost',
  host: '',
  port: 27017,
  user: 'gamebit777',
  password: 't8UE3cwGbP88NEklUB5JNFI3',
  database: 'gamebit777',
  useNewUrlParser: true
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MigrationDatasource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'mongodb';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mongodb', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
    console.log('\x1b[32m%s\x1b[0m', `MIGRATION DATABASE CONNECTION: ${process.env.MONGO_DB_URL}`);
  }
}
