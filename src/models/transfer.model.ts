import {Entity, model, property} from '@loopback/repository';

@model()
export class Transfer extends Entity {
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
    required: true,
  })
  coinCode: string;

  @property({
    type: 'string',
    required: true,
  })
  toUsername: string;

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
    type: 'string',
    default: ''
  })
  code: string;

  @property({
    type: 'string',
    default: ''
  })
  tokenCode: string;

  @property({
    type: 'number',
    default: 0
  })
  fee: number;

  @property({
    type: 'number',
    default: 0,
  })
  status?: number;

  @property({
    type: 'number',
    default: 0,
  })
  createdAt?: number;

  @property({
    type: 'number',
    default: 0,
  })
  updatedAt?: number;

  constructor(data?: Partial<Transfer>) {
    super(data);
  }
}

export interface TransferRelations {
  // describe navigational properties here
}

export type TransferWithRelations = Transfer & TransferRelations;
