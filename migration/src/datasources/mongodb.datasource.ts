import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'mongodb',
  connector: 'mongodb',
  url: `mongodb://127.0.0.1:27017/newcaltech`,
  host: '',
  port: 27017,
  user: '',
  password: '',
  database: '',
  useNewUrlParser: true,
  // 'user_name'     => 'gamebit777',
  // 'user_password' => 't8UE3cwGbP88NEklUB5JNFI3',
  // 'db_name'       => 'gamebit777',
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MongodbDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'mongodb';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mongodb', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
    console.log(
      '\x1b[32m%s\x1b[0m',
      `DATABASE CONNECTION: mongodb://127.0.0.1:27017/${process.env.MONGO_DB_COLLECTION}`,
    );
  }
}
