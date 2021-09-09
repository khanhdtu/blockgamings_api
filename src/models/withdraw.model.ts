import {Entity, model, property} from '@loopback/repository';

@model()
export class Withdraw extends Entity {
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
    default: '',
  })
  coinType?: string;

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
    type: 'string',
    default: '',
  })
  code: string;

  @property({
    type: 'number',
    default: 0,
  })
  fee?: number;

  @property({
    type: 'number',
    default: 0,
  })
  rate?: number;

  @property({
    type: 'string',
    default: '',
  })
  tokenCode?: string;

  @property({
    type: 'string',
    default: '',
  })
  txid?: string;

  @property({
    type: 'string',
    required: true,
  })
  address: string;

  @property({
    type: 'string',
    required: true,
  })
  status: number;

  @property({
    type: 'boolean',
    default: false
  })
  confirmed?: boolean;

  @property({
    type: 'boolean',
    default: false
  })
  paid?: boolean;

  @property({
    type: 'number',
    default: 0
  })
  verifyCode?: number;

  @property({
    type: 'number',
    default: 0
  })
  smsVerifyCode?: number;

  @property({
    type: 'number',
    default: 0,
  })
  createdAt?: number;

  constructor(data?: Partial<Withdraw>) {
    super(data);
  }
}

export interface WithdrawRelations {
  // describe navigational properties here
}

export type WithdrawWithRelations = Withdraw & WithdrawRelations;
