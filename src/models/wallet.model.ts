import {Entity, model, property} from '@loopback/repository';

@model()
export class Wallet extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id?: string;

  @property({
    type: 'string',
  })
  userId?: string;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    required: true,
  })
  coinCode: string;

  @property({
    type: 'number',
    default: 0,
  })
  balance?: number;

  @property({
    type: 'number',
  })
  status?: number;

  @property({
    type: 'number',
    default: '',
  })
  createdAt?: number;

  @property({
    type: 'number',
    default: 0,
  })
  updatedAt?: number;

  constructor(data?: Partial<Wallet>) {
    super(data);
  }
}

export interface WalletRelations {
  // describe navigational properties here
}

export type WalletWithRelations = Wallet & WalletRelations;
