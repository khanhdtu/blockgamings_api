import { Entity, model, property, hasMany} from '@loopback/repository';
import {Address} from './address.model';
import {Wallet} from './wallet.model';

@model({
  settings: {
    hiddenProperties: ['password', 'salt', 'verifyAccountCode', 'retypePassword', 'resetPasswordCode']
  },
})
export class User extends Entity {
  constructor(data?: Partial<User>) {
    super(data);
  }

  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
  })
  username: string;

  @property({
    type: 'string',
    format: 'email',
    default: '',
  })
  email: string;

  @property({
    type: 'string',
    default: '',
  })
  fullName: string;

  @property({
    type: 'string',
    default: '',
    jsonSchema: {
      minLength: 6,
    }
  })
  password: string;

  @property({
    type: 'string',
    default: '',
  })
  salt: string;

  @property({
    type: 'string',
  })
  retypePassword: string;

  @property({
    type: 'string',
  })
  resetPasswordCode: string;

  @property({
    type: 'string',
    default: 'ROLE_USER',
    enum: ['ROLE_USER', 'ROLE_MANAGER', 'ROLE_ADMIN', 'ROLE_PLAYER'],
  })
  role: 'ROLE_USER' | 'ROLE_MANAGER' | 'ROLE_ADMIN';

  @property({
    type: 'string',
    enum: ['ACTIVE', 'BLOCKED', 'PENDING'],
  })
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING';

  @property({
    type: 'string',
    default: '',
  })
  verifyAccountCode: string;

  @property({
    type: 'string',
    default: '',
  })
  phone: string;

  @property({
    type: 'string',
    default: '',
  })
  token: string;

  @property({
    type: 'string',
    default: '',
  })
  sponsor: string;

  @property({
    type: 'array',
    itemType: 'string',
    default: []
  })
  sponsorIds: string[];

  @property({
    type: 'string',
    default: '',
  })
  lastIpAddress: string;

  @hasMany(() => Address)
  addresses: Address[];

  @hasMany(() => Wallet)
  wallets: Wallet[];

  @property({
    type: 'boolean',
    default: false,
  })
  blocked: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  deposited: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  mustChangePassword?: boolean;

  @property({
    type: 'number',
    default: 0,
  })
  deletedAt: number;

  @property({
    type: 'number',
    default: 0,
  })
  lastAccessAt: number;

  @property({
    type: 'number',
    default: 0,
  })
  updatedAt: number;

  @property({
    type: 'number',
    default: 0,
  })
  createdAt: number;

  get validEmail(): boolean {
    const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reg.test(String(this.email).toLowerCase());
  }

  get validPassword(): boolean {
    const reg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    return reg.test(String(this.password).toLowerCase());
  }

  get validRetypePassword(): boolean {
    return this.password === this.retypePassword
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
