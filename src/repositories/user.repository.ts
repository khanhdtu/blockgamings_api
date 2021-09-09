import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory, BelongsToAccessor} from '@loopback/repository';
import {MongodbDataSource} from '../datasources/mongodb.datasource';
import {User, UserRelations, Address, Wallet} from '../models';
import {AddressRepository} from './address.repository';
import {WalletRepository} from './wallet.repository';

export interface Credentials {
  id?: string;
  username: string;
  email: string;
  role: string;
  password?: string;
  brandId?: string;
  tokenExpiresIn?: number;
  refreshTokenExpiresIn?: number;
  isValid?: boolean;
}

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly address: HasManyRepositoryFactory<Address, typeof User.prototype.id>;

  public readonly wallets: HasManyRepositoryFactory<Wallet, typeof User.prototype.id>;
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('AddressRepository') protected addressRepositoryGetter: Getter<AddressRepository>, @repository.getter('WalletRepository') protected walletRepositoryGetter: Getter<WalletRepository>,
  ) {
    super(User, dataSource);
    this.wallets = this.createHasManyRepositoryFactoryFor('wallets', walletRepositoryGetter,);
    this.registerInclusionResolver('wallets', this.wallets.inclusionResolver);
    this.address = this.createHasManyRepositoryFactoryFor('addresses', addressRepositoryGetter);
    this.registerInclusionResolver('addresses', this.address.inclusionResolver);
  }

  async findCredentials(
    userId: typeof User.prototype.id,
  ): Promise<User | undefined> {
    try {
      const find = await this.findById(userId)
      return find
    } catch (err) {
      if (err.code === 'ENTITY_NOT_FOUND') {
        return undefined;
      }
      throw err;
    }
  }
}
