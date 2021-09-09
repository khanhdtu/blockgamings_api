import { BootMixin } from '@loopback/boot';
import { ApplicationConfig, BindingKey, createBindingFromClass } from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import { RepositoryMixin, SchemaMigrationOptions } from '@loopback/repository';
import { RestApplication, RestBindings } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import { AuthenticationComponent, registerAuthenticationStrategy } from '@loopback/authentication';
import {
  SecuritySpecEnhancer,
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import { AuthorizationComponent } from '@loopback/authorization';
import { SonicXSequence } from './sequence';
import { LogErrorProvider } from './providers';
import { ErrorHandlerMiddlewareProvider } from './middlewares/error-handler.middleware';
import { randomBytes } from 'crypto';
import { UserManagementService, BasicAuthenticationStrategy, DomainAuthenticationStrategy } from './services';
import { CurrencyRepository, UserRepository } from './repositories';
import { format } from 'date-fns';
import { CronComponent, CronBindings } from '@loopback/cron';
import path from 'path';
import fs from 'fs';
import env from 'dotenv';
import YAML = require('yaml');
/**
 * Information from package.json
 */
export interface PackageInfo {
  name: string;
  version: string;
  description: string;
}
export const PackageKey = BindingKey.create<PackageInfo>('application.package');
const pkg: PackageInfo = require('../package.json');

export {ApplicationConfig};

export class BlockgamingApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    env.config();

    // Bind authentication component related elements
    this.component(AuthenticationComponent);
    // this.component(JWTAuthenticationComponent);
    this.component(AuthorizationComponent);
    this.component(CronComponent);

    // register your custom authentication strategy
    registerAuthenticationStrategy(this, BasicAuthenticationStrategy);
    registerAuthenticationStrategy(this, DomainAuthenticationStrategy);

    // Override log error provider
    this.bind(RestBindings.SequenceActions.LOG_ERROR).toProvider(
      LogErrorProvider,
    );

    // Set up the custom sequence
    this.sequence(SonicXSequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    // Start cronjob
    // this.add(createBindingFromClass(MigrationCronJob));
  }

  setUpBindings(): void {
    // Bind package.json to the application context
    this.bind(PackageKey).to(pkg);

    // Bind UserManagementService as global service
    this.bind(UserServiceBindings.USER_SERVICE).toClass(UserManagementService as never);

    this.add(createBindingFromClass(SecuritySpecEnhancer));
    this.add(createBindingFromClass(ErrorHandlerMiddlewareProvider));

    // Use JWT secret from JWT_SECRET environment variable if set
    // otherwise create a random string of 64 hex digits
    const secret =
      process.env.JWT_SECRET ?? randomBytes(32).toString('hex');
    this.bind(TokenServiceBindings.TOKEN_SECRET).to(secret);
  }

  // Unfortunately, TypeScript does not allow overriding methods inherited
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async start() {
    if (this.options.databaseSeeding !== false) {
      await this.migrateSchema();
    }
    await this.get(CronBindings.COMPONENT)
    return super.start();
  }

  async migrateSchema(options?: SchemaMigrationOptions): Promise<void> {
    await super.migrateSchema(options);

    // Pre-populate currencies
    // const currencyRepo = await this.getRepository(CurrencyRepository)
    // await currencyRepo.deleteAll()
    // const currenciesDir = path.join(__dirname, '../fixtures/currencies')
    // const currencyFiles = fs.readdirSync(currenciesDir)
    // for (const file of currencyFiles) {
    //   if (file.endsWith('.yml')) {
    //     const currencyFile = path.join(currenciesDir, file)
    //     const yamlString = fs.readFileSync(currencyFile, 'utf8');
    //     const currency = YAML.parse(yamlString);
    //     await currencyRepo.create({...currency, createdAt: format(new Date, 'yyyy-MM-dd hh:mm')});
    //   }
    // }

    // Pre-populate default admin
    const userRepository = await this.getRepository(UserRepository)
    const usersDir = path.join(__dirname, '../fixtures/users')
    const userFiles = fs.readdirSync(usersDir)
    for (const file of userFiles) {
      if (file.endsWith('.yml')) {
        const userFile = path.join(usersDir, file)
        const yamlString = fs.readFileSync(userFile, 'utf8');
        const user = YAML.parse(yamlString);
        try {
          await userRepository.create(user);
          console.log('admin is created successfully')
        } catch (error) {
          console.log('admin was created already')
        }
      }
    }
  }
}
