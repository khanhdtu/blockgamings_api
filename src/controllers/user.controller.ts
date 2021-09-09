import { inject } from '@loopback/core';
import { repository } from '@loopback/repository';
import {
  getModelSchemaRef,
  post,
  put,
  requestBody,
  response,
  RestBindings,
  Request
} from '@loopback/rest';
import { authenticate } from '@loopback/authentication';
import { UserRepository } from '../repositories';
import { generate as generateKeyPair } from '../utils/crypto';
import { author, UserManagementService } from '../services';
import { KeyBindings } from '../keys';
import { authorize } from '@loopback/authorization';
import { MESSAGE } from '../constants';
import {
  IResponse,
} from '../interfaces';
import { User } from '../models';
import { parsingRequestCtx } from '../utils';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    @inject(RestBindings.Http.REQUEST)
    private reqCtx: Request,

    @inject(KeyBindings.USER_SERVICE)
    public userManagementService: UserManagementService,
  ) {}

  @post('/users')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    description: 'Create user response',
    content: {
      'application/json': {
        schema: {
          title: 'New User',
          example: {message: MESSAGE.EMAIL_CREATE_ACCOUNT_SENT}
        }
      }
    },
  })
  async createUser(
    @requestBody({
      description: 'Create user request',
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {exclude: ['id', 'resetPasswordCode', 'verifyAccountCode', 'role', 'status', 'phone', 'token', 'password', 'retypePassword']})
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<IResponse<User>> {
    try {
      return await this.userManagementService.createUser(user);
    } catch (error) {
      return error;
    }
  }

  @put('/users/{id}')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    description: 'Update user response',
    content: {
      'application/json': {
        schema: {
          example: {message: MESSAGE.USER_UPDATED_SUCCESS}
        }
      }
    },
  })
  async updateUser(
    @requestBody({
      description: 'Update user request',
      content: {
        'application/json': {
          schema: {
            example: {id: '', phone: '', address: '', password: '', retypePassword: ''}
          }
        },
      },
    })
    user: User,
  ): Promise<IResponse<{}>> {
    try {
      const updating = await this.userManagementService.updateUser(user);
      return updating
    } catch (error) {
      return error;
    }
  }

  @post('/users/admin')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_ADMIN'], voters: [author]})
  @response(200, {
    description: 'Create Admin user response',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true, exclude: ['resetPasswordCode','resetPasswordCode','token']})
      }
    },
  })
  async createAdminUser(
    @requestBody({
      description: 'Create admin user request',
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'New Admin User',
            exclude: ['id', 'resetPasswordCode', 'verifyAccountCode', 'role', 'status', 'phone', 'token']
          })
        },
      },
    })
    user: Omit<User, 'ids'>,
  ): Promise<IResponse<User>> {
    try {
      return await this.userManagementService.createAdminUser(user);
    } catch (error) {
      return error;
    }
  }

  @post('/users/verification')
  @response(200, {
    description: 'Create user confirmation response',
    content: {
      'application/json': {
        schema: {
          example: {message: MESSAGE.USER_CREATED_SUCCESS}
        }
      }
    }
  })
  async createUserVerification(
    @requestBody({
      description: 'Verification of creating user request',
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {exclude: ['id', 'resetPasswordCode', 'role', 'status', 'phone', 'token']})
        },
      },
    })
    user: Omit<User, 'id'>
  ) {
    try {
      return await this.userManagementService.createUserVerification(user)
    } catch (error) {
      return error
    }
  }

  @post('/users/login')
  @response(200, {
    description: 'Login response',
    content: {'application/json': {
      schema:  getModelSchemaRef(User, {includeRelations: true, exclude: ['resetPasswordCode', 'retypePassword', 'verifyAccountCode', 'password', 'salt']})
    }},
  })
  async login(
    @requestBody({
      description: 'Login request',
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {exclude: ['id', 'resetPasswordCode', 'retypePassword', 'role', 'status', 'phone', 'verifyAccountCode', 'token']})
        }
      }
    }) creds: Omit<User, 'id'>,
  ): Promise<IResponse<User | {}>> {
    try {
      return await this.userManagementService.login(creds)
    } catch (error) {
      return error;
    }
  }

  @post('/users/global-login')
  @authenticate('authen-domain')
  @response(200, {
    content: {'application/json': {
      schema:  getModelSchemaRef(User, {includeRelations: true, exclude: ['resetPasswordCode', 'retypePassword', 'verifyAccountCode', 'password', 'salt']})
    }},
  })
  async globalLogin(
    @requestBody({
      description: 'Login request',
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {exclude: ['resetPasswordCode', 'retypePassword', 'phone', 'verifyAccountCode', 'token']})
        }
      }
    }) creds: User,
  ): Promise<IResponse<User | {}>> {
    try {
      return await this.userManagementService.globalLogin(creds)
    } catch (error) {
      return error;
    }
  }

  @post('/users/admin-refresh-token')
  // @authenticate('authen-domain')
  @response(200, {
    content: {'application/json': {
      schema:  getModelSchemaRef(User, {includeRelations: true, exclude: ['resetPasswordCode', 'retypePassword', 'verifyAccountCode', 'password', 'salt']})
    }},
  })
  async adminRefreshToken(
    @requestBody() { userId }: { userId: string },
  ): Promise<IResponse<User | {}>> {
    try {
      return await this.userManagementService.adminRefreshToken(userId)
    } catch (error) {
      return error;
    }
  }

  @post('/users/change-password')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  async changePassword(
    @requestBody() creds: { userId: string, password: string, retypePassword: string }
  ) {
    try {
      const { id } = parsingRequestCtx(this.reqCtx)
      return await this.userManagementService.changePassword(
        id ?? '',
        creds.password,
        creds.retypePassword
      )
    } catch (error) {
      return error
    }
  }

  @post('/users/admin-registration-request')
  @response(200, {
    description: 'Admin registration response',
    content: {'application/json': {
      schema:  getModelSchemaRef(User, {includeRelations: true, exclude: ['resetPasswordCode', 'retypePassword', 'verifyAccountCode']})
    }},
  })
  async localAdminRegistrationRequest(
    @requestBody({
      description: 'Admin registration request',
      content: {
        'application/json': {
          schema: {
            example: { username: '', email: '', fullName: '' }
          }
        }
      }
    }) creds: { username: string, fullName: string, email?: string },
  ): Promise<IResponse<{}>> {
    try {
      return await this.userManagementService.localAdminRegistrationRequest(creds)
    } catch (error) {
      return error;
    }
  }

  @post('/users/admin-registration-approve')
  @authenticate('authen-domain')
  @response(200, {
    description: 'Admin registration response',
    content: {'application/json': {
      schema:  getModelSchemaRef(User, {includeRelations: true, exclude: ['resetPasswordCode', 'retypePassword', 'verifyAccountCode']})
    }},
  })
  async localAdminRegistrationApprove(
    @requestBody({
      description: 'Admin registration request',
      content: {
        'application/json': {
          schema: {
            example: {userId: '', approved: true}
          }
        }
      }
    }) body: {userId: string, approved: boolean},
  ): Promise<IResponse<User | {}>> {
    try {
      return await this.userManagementService.localAdminRegistrationApprove(body.userId, body.approved)
    } catch (error) {
      return error;
    }
  }

  @post('/users/reset-password-request')
  @response(200, {
    description: 'Reset password response',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          example: {message: MESSAGE.PASSWORD_RESET_SENT}
        }
      }
    }
  })
  async resetPasswordRequest(
    @requestBody({
      description: 'Reset password request',
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {exclude: ['id', 'resetPasswordCode', 'retypePassword', 'role', 'status', 'phone', 'verifyAccountCode', 'token', 'password']})
        }
      }
    }) creds: Omit<User, 'id'>
  ) {
    try {
      const sending = await this.userManagementService.sendResetPasswordMail(creds.email, creds.username)
      return sending
    } catch (error) {
      return error
    }
  }

  @post('/users/reset-password-confirm')
  @response(200, {
    description: 'Reset password confirmation response',
    content: {
      'application/json': {
        schema: {
          example: {message: MESSAGE.PASSWORD_RESET_SUCCESS}
        }
      }
    },
  })
  async resetPassword(
    @requestBody({
      description: 'Reset password confirmation request',
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {exclude: ['id', 'role', 'status', 'phone', 'verifyAccountCode', 'token']})
        }
      }
    }) creds: Omit<User, 'id'>
  ) {
    try {
      const resetting = await this.userManagementService.resetPassword(creds)
      return resetting
    } catch (error) {
      return error
    }
  }

  @post('/keys')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_ADMIN'], voters: [author]})
  @response(200, {
    description: 'Generate keys response',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': new IResponse<{publicKey: string, privateKey: string}>(),
          example: {publicKey: 'string', privateKey: 'string'}
        }
      }
    }
  })
  async generate(): Promise<IResponse<{publicKey: string, privateKey: string}>> {
    return {
      statusCode: 200,
      message: MESSAGE.GENERATE_KEY_PAIR_SUCCESS,
      data: generateKeyPair()
    };
  }
}
