import {Entity, model, property} from '@loopback/repository';

@model()
export class Deposit extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    default: ''
  })
  type: string;

  @property({
    type: 'string',
    required: true,
  })
  coinCode: string;

  @property({
    type: 'number',
    default: 0,
  })
  amount?: number;

  @property({
    type: 'number',
    default: 0,
  })
  amountUsdt?: number;

  @property({
    type: 'number',
    default: 0,
  })
  amountEuro?: number;

  @property({
    type: 'number',
    default: 0,
  })
  rate?: number;

  @property({
    type: 'string',
    default: ''
  })
  tokenCode: string;

  @property({
    type: 'number',
    default: 0,
  })
  createdAt?: number;

  constructor(data?: Partial<Deposit>) {
    super(data);
  }
}

export interface DepositRelations {
  // describe navigational properties here
}

export type DepositWithRelations = Deposit & DepositRelations;
