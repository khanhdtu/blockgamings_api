import { injectable, BindingScope, inject } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { v4 as uuidv4 } from 'uuid';
import { MESSAGE } from '../constants';
import { IResponse, IResponseList } from '../interfaces';
import { KeyBindings } from '../keys';
import { User } from '../models/user.model';
import { AddressRepository, UserRepository, WalletRepository } from '../repositories';
import { encrypt } from '../utils/crypto';
import { EmailService } from './email.service';

@injectable({scope: BindingScope.TRANSIENT})
export class UsersService {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    @repository(AddressRepository)
    public addressRepository: AddressRepository,

    @repository(WalletRepository)
    public walletRepository: WalletRepository,

    @inject(KeyBindings.EMAIL_SERVICE)
    public emailService: EmailService,
  ) {}

  async getCustomers(filter = {}, search = ''): Promise<IResponseList<User>> {
    const users = await this.userRepository.find({
      where: {role: 'ROLE_USER'},
      order: ['createdAt DESC', 'updatedAt DESC'],
      ...filter,
    })
    const { count } = await this.userRepository.count();

    if (!search) {
      return {
        statusCode: 200,
        data: {
          list: users,
          count: count
        }
      }
    }
    const value = search?.trim().toLowerCase()
    // const { count } = await this.userRepository.count({
    //   username: { like: value },
    //   email: { like: value },
    //   fullName: { like: value },
    // });
    return {
      statusCode: 200,
      data: {
        list: users.filter(
          user => (
            user.email.toLowerCase().includes(value)) ||
            user?.fullName.toLowerCase().includes(value) ||
            user?.username?.toLowerCase().includes(value)
          ),
        count
      }
    }
  }

  async getRegistrations(filter = {}, search = ''): Promise<IResponseList<User>> {
    const users = await this.userRepository.find({
      where: {status: 'PENDING', role: 'ROLE_USER'},
      order: ['createdAt DESC', 'updatedAt DESC'],
      ...filter,
    })
    const { count } = await this.userRepository.count()
    if (!search) {
      return {
        statusCode: 200,
        data: { list: users, count }
      }
    }
    const value = search?.trim().toLowerCase()

    return {
      statusCode: 200,
      data: {
        list: users.filter(
          user => (
            user.email.toLowerCase().includes(value)) ||
            user?.fullName.toLowerCase().includes(value) ||
            user?.username?.toLowerCase().includes(value) ||
            user?.phone?.toLowerCase().includes(value)
        ),
        count
      }
    }
  }

  async createCustomer(creds: {email: string, username: string}): Promise<IResponse<User>> {
    const emailFound = await this.userRepository.findOne({where: {email: creds.email}})
    if (emailFound) {
      throw new HttpErrors.Forbidden(MESSAGE.EMAIL_EXISTED)
    }

    const usernameFound = await this.userRepository.findOne({where: {username: creds.username}})
    if (usernameFound) {
      throw new HttpErrors.Forbidden(MESSAGE.USERNAME_EXISTED)
    }

    const newCustomer = new User(creds)
    if (!newCustomer.validEmail) {
      throw new HttpErrors.BadRequest(MESSAGE.EMAIL_INVALID)
    }
    if (!newCustomer.username) {
      throw new HttpErrors.BadRequest(MESSAGE.EMAIL_INVALID)
    }

    const verifyAccountCode = uuidv4()
    const customerCreated = await this.userRepository.create(
      {
        email: newCustomer.email,
        username: newCustomer.username,
        status: 'PENDING',
        password: 'UNCHANGE_PASSWORD',
        verifyAccountCode,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
      }
    )
    await this.emailService.sendCreateAccountConfirmationMail(customerCreated, verifyAccountCode)
    return {
      statusCode: 200,
      message: `${MESSAGE.EMAIL_CREATE_ACCOUNT_SENT} ${customerCreated.email}`,
      data: customerCreated
    }
  }

  async createCustomerVerification(user: User): Promise<IResponse<{}>> {
    const newUser = new User(user)
    const { username, email, verifyAccountCode } = newUser
    const userFound = await this.userRepository.findOne({ where: { username, email } })
    if (!userFound) {
      throw new HttpErrors.Forbidden(MESSAGE.EMAIL_USERNAME_NOT_CORRECT)
    }

    const verifyCodeFound = await this.userRepository.findOne({ where: { verifyAccountCode } })
    if (!verifyCodeFound) {
      throw new HttpErrors.Forbidden(MESSAGE.VERIFY_ACCOUNT_CODE_INVALID)
    }

    if (!newUser.validPassword) {
      throw new HttpErrors.BadRequest(MESSAGE.PASSWORD_INVALID)
    }

    if (!newUser.validRetypePassword) {
      throw new HttpErrors.BadRequest(MESSAGE.PASSWORD_NOT_MATCH)
    }

    await this.userRepository.updateById(userFound.id,
      { status: "ACTIVE", username: user.username, password: user.password, verifyAccountCode: 'VERIFIED' }
    )

    return {
      statusCode: 200,
      message: MESSAGE.USER_CREATED_SUCCESS,
      data: {}
    }
  }

  async updateCustomer(customer: User): Promise<IResponse<User>> {
    const updatedAt = new Date().getTime()
    await this.userRepository.updateById(customer.id, {
      fullName: customer.fullName,
      phone: customer.phone,
      status: customer.status,
      updatedAt,
    })

    return {
      statusCode: 200,
      message: MESSAGE.USER_UPDATED_SUCCESS,
      data: {...customer, updatedAt} as User,
    }
  }

  async deleteCustomer(id: string): Promise<IResponse<User>> {
    const userFound = await this.userRepository.findById(id)
    if (!userFound) {
      throw new HttpErrors.Forbidden(MESSAGE.USER_NOT_FOUND)
    }
    await this.userRepository.deleteById(id)
    return {
      statusCode: 200,
      message: MESSAGE.USER_DELETED_SUCCESS,
      data: userFound
    }
  }

  async getSystemUsers(filter = {}, search = ''): Promise<IResponseList<User>> {
    const list = await this.userRepository.find({
      where: { role: 'ROLE_ADMIN' },
      order: ['updatedAt DESC'],
      ...filter,
    })
    const { count } = await this.userRepository.count({role: 'ROLE_ADMIN'})
    if (!search) {
      return {
        statusCode: 200,
        data: { list, count }
      }
    }

    const value = search.trim().toLowerCase() ?? ''

    return {
      statusCode: 200,
      data: {
        list: list.filter(
          sys => (
            (sys.id?.toLowerCase().includes(value) ??
            sys.email.toLowerCase().includes(value)) ||
            sys.phone?.toLowerCase().includes(value) ||
            sys.role?.toLowerCase().includes(value) ||
            sys.username?.toLowerCase().includes(value)
          )
        ),
        count
      }
    }
  }

  async createSystemUser(user: {username: string, password: string}): Promise<IResponse<User>> {
    const found = await this.userRepository.findOne({where: {username: user.username}})
    if (found) {
      throw new HttpErrors.Forbidden(MESSAGE.USERNAME_EXISTED)
    }

    if (user.password.length < 6) {
      throw new HttpErrors[400](MESSAGE.PASSWORD_INVALID)
    }

    try {
      const userCreated = await this.userRepository.create({
        username: user.username,
        password: encrypt(user.password),
        role: 'ROLE_MANAGER',
        salt: new Date().getTime().toString(),
        createdAt: new Date().getTime()
      })

      return {
        statusCode: 200,
        message: MESSAGE.USER_CREATED_SUCCESS,
        data: userCreated
      }
    } catch (error) {
      return error
    }
  }

  async getWalletAccounts(filter = {}, search = ''): Promise<IResponseList<User>> {
    const list = await this.userRepository.find({
      include: [
        {relation: 'wallets', scope: {where: {'coinCode': 'usd'}}}
      ],
      ...filter,
    })
    const { count } = await this.userRepository.count()
    if (!search)
      return {
        statusCode: 200,
        data: { list, count }
      }
    return {
      statusCode: 200,
      data: {
        list: list.filter(user =>
          user.username.toLowerCase().includes(search?.toLowerCase() ?? '') ||
          user.email.toLowerCase().includes(search?.toLowerCase() ?? '') ||
          user.fullName.toLowerCase().includes(search?.toLowerCase() ?? '')
        ),
        count,
      }
    }
  }

  async getAddressAccounts(filter = {}, search = ''): Promise<IResponse<User[]>> {
    const users = await this.userRepository.find({
      include: [
        {relation: 'addresses'}
      ],
      ...filter,
    })
    return {
      statusCode: 200,
      data: users
    }
  }
}
