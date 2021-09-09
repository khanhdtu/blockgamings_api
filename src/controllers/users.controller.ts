// import { authenticate } from '@loopback/authentication';
// import { authorize } from '@loopback/authorization';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { inject } from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import { MESSAGE } from '../constants';
import { IResponse, IResponseList } from '../interfaces';
import { KeyBindings } from '../keys';
import { User } from '../models';
import { UserRepository } from '../repositories';
import { author, UsersService } from '../services';

export class UsersController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    @inject(KeyBindings.USERS_SERVICE)
    public usersService: UsersService
  ) {}

  // CUSTOMERS
  @get('users/customers')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    description: 'Array of User Model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true})
        }
      }
    },
  })
  async find(
    @param.filter(User) filter: Filter,
    @param.query.string('search') search: string,
  ): Promise<IResponseList<User>> {
    try {
      return await this.usersService.getCustomers(filter, search);
    } catch (error) {
      return error
    }
  }

  @post('users/customers')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    description: 'Object of User Model instances',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async createCustomer(
    @requestBody({
      description: 'Create customer request',
    }) creds: { email: string, username: string }
  ): Promise<IResponse<User>> {
    try {
      return await this.usersService.createCustomer(creds);
    } catch (error) {
      return error
    }
  }

  @post('users/customers/verification')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    description: 'Object of User Model instances',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async createCustomerVerification(
    @requestBody({
      description: 'Verification of creating user request',
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {exclude: ['id', 'resetPasswordCode', 'role', 'status', 'phone', 'token']})
        },
      },
    })
    user: Omit<User, 'id'>
  ): Promise<IResponse<{}>> {
    try {
      return await this.usersService.createCustomerVerification(user);
    } catch (error) {
      return error
    }
  }

  @put('users/customers/{id}')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    description: 'Object of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async updateCustomer(customer: User): Promise<IResponse<{}>> {
    try {
      return await this.usersService.updateCustomer(customer)
    } catch (error) {
      return error
    }
  }

  @patch('users/customers')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    description: 'User PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.updateAll(user, where);
  }

  @get('users/customers/{id}')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  @patch('users/customers/{id}')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @put('users/customers/{id}')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(204, {
    description: 'Update user success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() user: User,
  ): Promise<IResponse<{}>> {
    try {
      const updating = await this.usersService.updateCustomer(user)
      return updating
    } catch (error) {
      return error
    }
  }

  @del('users/customers/{id}')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<IResponse<User>> {
    const userDeleted = await this.usersService.deleteCustomer(id)
    return userDeleted
  }

  @get('users/system-users')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    description: 'Array of Customers model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async findManagers(
    @param.filter(User) filter: Filter,
    @param.query.string('search') search: string
  ): Promise<IResponseList<User>> {
    try {
      return await this.usersService.getSystemUsers(filter, search);
    } catch (error) {
      return error
    }
  }

  @post('users/system-users')
  @authenticate('authen-domain')
  // @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  async createSystemUser(
    @requestBody() user: { username: string, password: string }
  ): Promise<IResponse<User>> {
    try {
      return await this.usersService.createSystemUser(user);
    } catch (error) {
      return error
    }
  }

  @del('users/system-users/{id}')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(204, {
    description: 'Delete system user response',
  })
  async deleteSystemUser(@param.path.string('id') id: string): Promise<IResponse<string>> {
    try {
      await this.userRepository.deleteById(id)
      return {
        statusCode: 200,
        message: MESSAGE.USER_DELETED_SUCCESS,
        data: id
      }
    } catch (error) {
      return error
    }
  }

  @get('users/registrations')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async findRegistrations(
    @param.filter(User) filter: Filter,
    @param.query.string('search') search: string
  ): Promise<IResponseList<User>> {
    try {
      return await this.usersService.getRegistrations(filter, search);
    } catch (error) {
      return error
    }
  }

  // Wallet Accounts
  @get('users/wallets')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true})
        }
      }
    },
  })
  async findWallets(
    @param.filter(User) filter: Filter,
    @param.query.string('search') search: string,
  ): Promise<IResponseList<User>> {
    try {
      return await this.usersService.getWalletAccounts(filter, search);
    } catch (error) {
      return error
    }
  }

  // Address Accounts
  @get('users/addresses')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    description: 'Array of wallet users model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true})
        }
      }
    },
  })
  async findAddresses(
    @param.filter(User) filter: Filter,
    @param.query.string('search') search: string,
  ): Promise<IResponse<User[]>> {
    try {
      return await this.usersService.getAddressAccounts(filter, search);
    } catch (error) {
      return error
    }
  }
}
