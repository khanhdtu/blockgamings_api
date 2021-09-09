import {inject} from '@loopback/core';
import {UserService} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {v4 as uuidv4} from 'uuid';
import {UserRepository, Credentials} from '../repositories/user.repository';
import {addTokenExpiresIn, isExpired, decrypt, encrypt} from '../utils';
import {KeyBindings} from '../keys';
import {MESSAGE} from '../constants';
import {User} from '../models';
import {EmailService} from './email.service';
import {IResponse} from '../interfaces';
import axios from 'axios';
import sha1 from 'salted-sha1';

export class UserManagementService implements UserService<User, Credentials> {
  blockgamingsIP = process.env.BLOCKGAMINGS_IP ?? '';
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    @inject(KeyBindings.EMAIL_SERVICE)
    public emailService: EmailService,
  ){}

  convertToUserProfile(user: User): UserProfile | any {
    return {
      [securityId]: user.id,
      id: user.id,
      name: user.username,
      email: user.email,
      roles: [user.role],
    };
  }

  verifyToken(token: string): Credentials {
    try {
      const tokenCreds: Credentials = JSON.parse(decrypt(token));
      if (isExpired(tokenCreds.tokenExpiresIn ?? 0)) {
        tokenCreds.isValid = false;
      } else {
        tokenCreds.isValid = true;
      }
      return tokenCreds
    } catch (error) {
      const invalidCreds = { id: '', username: '', email: '', role: '', isValid: false }
      return invalidCreds;
    }
  }

  generateToken(creds: Credentials): string {
    const tokenCreds: Credentials = {...creds, tokenExpiresIn: addTokenExpiresIn()}
    const tokenEncrypted = encrypt(JSON.stringify(tokenCreds));
    return tokenEncrypted
  }

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const { email, password, username } = credentials;

    const foundUser = await this.userRepository.findOne({
      where: {username, email},
      fields: {resetPasswordCode: false, verifyAccountCode: false}
    });

    if (!foundUser) {
      throw new HttpErrors.Unauthorized(MESSAGE.EMAIL_USERNAME_NOT_CORRECT);
    }

    // const passwordMatched = comparePassword(password ?? '', foundUser.password);
    if (password !== foundUser.password) {
      throw new HttpErrors.Forbidden(MESSAGE.PASSWORD_NOT_CORRECT)
    }

    if (foundUser.status === 'PENDING') {
      throw new HttpErrors.Forbidden(MESSAGE.EMAIL_REMIND_CREATE_ACCOUNT)
    }

    if (foundUser.status === 'BLOCKED') {
      throw new HttpErrors.Forbidden(MESSAGE.ACCOUNT_BLOCKED)
    }

    return foundUser;
  }

  async login(creds: Credentials): Promise<IResponse<{}>> {
    const userFound = await this.userRepository.findOne({
      where: {username: decrypt(creds.username)},
    })
    if (!userFound) {
      throw new HttpErrors.Forbidden(MESSAGE.USER_NOT_FOUND)
    }
    if (userFound.role === 'ROLE_USER') {
      throw new HttpErrors.Forbidden(MESSAGE.USER_NOT_ALLOW_TO_ACCESS_BRAND)
    }
    const password = sha1(decrypt(creds.password ?? ''), userFound.salt) as string
    if (password.toUpperCase() !== userFound.password) {
      throw new HttpErrors.BadGateway(MESSAGE.PASSWORD_NOT_CORRECT)
    }
    userFound.token = this.generateToken(userFound)
    userFound.mustChangePassword = decrypt(creds.password ?? '') === 'Abc123'
    return {
      statusCode: 200,
      message: MESSAGE.LOGIN_SUCCESS,
      data: userFound
    }
  }

  async globalLogin(user: User): Promise<IResponse<{}>> {
    user.token = this.generateToken(user)
    return {
      statusCode: 200,
      message: MESSAGE.LOGIN_SUCCESS,
      data: user
    }
  }

  async localAdminRegistrationRequest(creds: {username: string, fullName: string, email?: string}): Promise<IResponse<User>> {
    let userFound;
    if (creds.email) {
      userFound = await this.userRepository.findOne({
        where: {email: creds.email},
      })
    }
    if (creds.username) {
      userFound = await this.userRepository.findOne({
        where: {username: creds.username},
      })
    }

    if (!userFound) {
      throw new HttpErrors.Forbidden(MESSAGE.EMAIL_USERNAME_NOT_CORRECT)
    }
    if (userFound.role !== 'ROLE_USER' && userFound.status === 'PENDING') {
      throw new HttpErrors.BadGateway(MESSAGE.USER_ADMIN_REGISTER_ALREADY)
    } else {
      if (userFound.role !== 'ROLE_USER') {
        throw new HttpErrors.BadGateway(MESSAGE.USER_ADMIN_REGISTER_INVALID)
      }
      if (userFound.status === 'PENDING') {
        throw new HttpErrors.BadGateway(MESSAGE.USER_ADMIN_REGISTER_ALREADY)
      }
      await this.userRepository.updateById(userFound.id, {
        status: 'PENDING',
        updatedAt: new Date().getTime()
      })
      return {
        statusCode: 200,
        message: MESSAGE.USER_ADMIN_REGISTER_SUCCESS,
        data: { ...userFound, password: userFound.password } as User
      }
    }
  }

  async localAdminRegistrationApprove(userId: string, approved: boolean): Promise<IResponse<{}>> {
    const role = approved ? 'ROLE_MANAGER' : 'ROLE_USER'
    await this.userRepository.updateById(userId, {
      role,
      status: 'ACTIVE',
      updatedAt: new Date().getTime()
    })
    return {
      statusCode: 200,
      message: approved ? MESSAGE.USER_ADMIN_APPROVED_REGISTER_SUCCESS : MESSAGE.USER_ADMIN_REJECTED_REGISTER_SUCCESS,
      data: { id: userId, role }
    }
  }

  async updateUser(user: User): Promise<IResponse<User>> {
    const userFound = await this.userRepository.findById(user.id)
    if (!userFound) {
      throw new HttpErrors.BadGateway(MESSAGE.USER_NOT_FOUND)
    }
    if (user.password) {
      await axios.put(`${process.env.MIGRATION_URL}/migration/users/password-sync`, {
        id: user.id,
        password: sha1(user.password, userFound.salt),
      })
      await this.userRepository.updateById(userFound.id, {
        password: sha1(user.password, userFound.salt),
        updatedAt: new Date().getTime()
      })
    } else {
      await this.userRepository.updateById(user.id, {
        fullName: user.fullName || userFound.fullName,
        phone: user.phone || userFound.phone,
        updatedAt: new Date().getTime()
      })
    }
    return {
      statusCode: 200,
      message: MESSAGE.USER_UPDATED_SUCCESS,
      data: userFound
    }
  }

  async createAdminUser(user: User): Promise<IResponse<User>> {
    const admin = new User(user)
    if (admin.email && !admin.validEmail) {
      throw new HttpErrors.BadGateway(MESSAGE.EMAIL_INVALID)
    }
    const userFound = await this.userRepository.findOne({ where:
      { email: user.email, username: user.username },
    })
    if (userFound) {
      throw new HttpErrors[409](MESSAGE.EMAIL_OR_USERNAME_EXISTED)
    }
    if (!admin.retypePassword) {
      throw new HttpErrors.BadRequest(MESSAGE.PASSWORD_NOT_MATCH)
    }
    const userCreated = await this.userRepository.create(
      { ...user, role: 'ROLE_ADMIN', updatedAt: new Date().getTime()}
    )
    return {
      statusCode: 200,
      message: MESSAGE.USER_CREATED_SUCCESS,
      data: userCreated
    }
  }

  async sendResetPasswordMail(email: string, username: string): Promise<IResponse<{}>> {
    const userFound = await this.userRepository.findOne({where: { email, username }})
    if (!userFound) {
      throw new HttpErrors.Unauthorized(MESSAGE.EMAIL_USERNAME_NOT_EXISTED)
    }

    const resetPasswordCode = uuidv4();
    await this.userRepository.updateById(userFound.id, { username, resetPasswordCode })
    await this.emailService.sendResetPasswordMail(userFound, resetPasswordCode)

    return {
      statusCode: 200,
      data: '',
      message: `${MESSAGE.PASSWORD_RESET_SENT}${email}`,
    }
  }

  async resetPassword(creds: User): Promise<IResponse<{}>> {
    if (!creds.password || creds.password !== creds.retypePassword) {
      throw new HttpErrors.BadRequest(MESSAGE.PASSWORD_NOT_MATCH)
    }

    const passwordReg = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/
    if (!passwordReg.test(String(creds.password))) {
      throw new HttpErrors.BadGateway(MESSAGE.PASSWORD_INVALID)
    }

    const uuidReg = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidReg.test(String(creds.resetPasswordCode))) {
      throw new HttpErrors.Forbidden(MESSAGE.RESET_CODE_INVALID)
    }

    const user = await this.userRepository.findOne({ where: { resetPasswordCode: creds.resetPasswordCode } })
    if (!user) {
      throw new HttpErrors.Forbidden(MESSAGE.RESET_CODE_INVALID)
    }

    await this.userRepository.updateById(user.id, {
      username: user.username, password: creds.password, resetPasswordCode: '', updatedAt: new Date().getTime()
    })

    return {
      statusCode: 200,
      message: MESSAGE.PASSWORD_RESET_SUCCESS,
      data: ''
    }
  }

  async createUser(user: User): Promise<IResponse<User>> {
    const newUser = new User(user)
    if (!newUser.validEmail) {
      throw new HttpErrors.BadGateway(MESSAGE.EMAIL_INVALID)
    }

    if (!newUser.username) {
      throw new HttpErrors.BadGateway(MESSAGE.EMAIL_INVALID)
    }

    const userFound = await this.userRepository.findOne({ where:
      { email: user.email, username: user.username },
    })

    if (userFound) {
      throw new HttpErrors[409](MESSAGE.EMAIL_OR_USERNAME_EXISTED)
    }

    const verifyAccountCode = uuidv4()
    const userCreated = await this.userRepository.create(
      {
        email: user.email,
        username: user.username,
        status: 'PENDING',
        password: 'INVALID',
        verifyAccountCode,
        createdAt: new Date().getTime(),
      }
    )

    await this.emailService.sendCreateAccountConfirmationMail(userCreated, verifyAccountCode)
    return {
      statusCode: 200,
      message: MESSAGE.EMAIL_CREATE_ACCOUNT_SENT,
      data: userCreated
    }
  }

  async createUserVerification(user: User): Promise<IResponse<{}>> {
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

  async adminRefreshToken(userId: string): Promise<IResponse<User>> {
    try {
      const userFound = await this.userRepository.findById(userId)
      if (!userFound) {
        throw new HttpErrors.Forbidden(MESSAGE.USER_NOT_FOUND)
      }
      if (userFound.role === 'ROLE_USER') {
        throw new HttpErrors.Forbidden(MESSAGE.USER_NOT_ALLOW_TO_ACCESS_BRAND)
      }
      userFound.token = this.generateToken(userFound)
      return {
        statusCode: 200,
        data: userFound
      }
    } catch (error) {
      return error
    }
  }

  async changePassword(userId: string, password: string, retypePassword: string) {
    try {
      const userFound = await this.userRepository.findById(userId)
      if (!userFound) {
        throw new HttpErrors.Forbidden(MESSAGE.USER_NOT_FOUND)
      }
      const passwordDecrypted = decrypt(password)
      const rePasswordDecrypted = decrypt(retypePassword)
      if (passwordDecrypted !== rePasswordDecrypted) {
        throw new HttpErrors[400](MESSAGE.PASSWORD_NOT_MATCH)
      }
      if (passwordDecrypted.length < 6 || rePasswordDecrypted.length < 6) {
        throw new HttpErrors[400](MESSAGE.PASSWORD_INVALID)
      }
      try {
        await this.userRepository.updateById(userId, { password })
        return {
          statusCode: 200,
          message: MESSAGE.PASSWORD_RESET_SUCCESS,
          data: { id: userId }
        }
      } catch (error) {
        return error
      }
    } catch (error) {
      return error
    }
  }
}