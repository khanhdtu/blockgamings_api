import { HttpErrors, Request } from '@loopback/rest';
import { MESSAGE } from '../constants';
import { User } from '../models/user.model';
import { decrypt } from './crypto';

export const randomCode = (min: number, max: number) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const checkType = (input: string): 'EMAIL' | 'USERNAME' => {
  if (input.includes('@')) return 'EMAIL'
  return 'USERNAME'
}

export const convertToUserProfile = (data: any): any => {
  const { rows } = data
  let role = 'ROLE_USER'
  let user = {}
  if (rows['isManager']) {
    role = 'ROLE_MANAGER'
  }
  if (rows['IsAdmin']) {
    role = 'ROLE_ADMIN'
  }
  user = {
    id: rows['ID'].toString(),
    email: rows['Email'],
    username: rows['UserName'],
    fullName: rows['FullName'],
    role: role,
    token: data.token
  }
  return user
}

export const formatKey = (publicKey: string): string => {
  let key = ''
  const splited = publicKey.split('*')
  splited.map(str => {
    key += str + '\n'
  })
  return key
}

export const parsingRequestCtx = (context: Request): User => {
  try {
    const { headers } = context
    const user = decrypt(headers['token'] as string)
    return JSON.parse(user) as User
  } catch (error) {
    throw new HttpErrors.Forbidden(MESSAGE.TOKEN_EXPIRED);
  }
}