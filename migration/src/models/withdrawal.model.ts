/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    mongodb: {
      collection: 'trade.WalletsWithdrawals',
    },
  },
})
export class Withdrawal extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'number',
  })
  id?: number;

  @property({
    type: 'string',
  })
  code?: string;

  @property({
    type: 'number',
  })
  user_id?: number;

  @property({
    type: 'string',
  })
  user_name?: string;

  @property({
    type: 'string',
  })
  user_fullname?: string;

  @property({
    type: 'string',
  })
  user_email?: string;

  @property({
    type: 'number',
  })
  balance?: number;

  @property({
    type: 'number',
  })
  coin_balance?: number;

  @property({
    type: 'string',
  })
  coin?: string;

  @property({
    type: 'string',
  })
  coin_type?: string;

  @property({
    type: 'number',
  })
  amount?: number;

  @property({
    type: 'number',
  })
  amount_coin?: number;

  @property({
    type: 'number',
  })
  amount_after_fee?: number;

  @property({
    type: 'number',
  })
  amount_usd?: number;

  @property({
    type: 'number',
  })
  amount_usd_after_fee?: number;

  @property({
    type: 'number',
  })
  amount_euro?: number;

  @property({
    type: 'number',
  })
  amount_euro_after_fee?: number;

  @property({
    type: 'number',
  })
  fee?: number;

  @property({
    type: 'string',
  })
  address?: string;

  @property({
    type: 'number',
  })
  rate?: number;

  @property({
    type: 'boolean',
  })
  is_confirmed?: boolean;

  @property({
    type: 'boolean',
  })
  is_paid?: boolean;

  @property({
    type: 'number',
  })
  retry?: number;

  @property({
    type: 'number',
  })
  status?: number;

  @property({
    type: 'boolean',
  })
  is_request?: boolean;

  @property({
    type: 'string',
  })
  comfirm_code?: string;

  @property({
    type: 'string',
  })
  sms_code?: string;

  @property({
    type: 'number',
  })
  time?: number;

  @property({
    type: 'string',
  })
  txid?: string;

  constructor(data?: Partial<Withdrawal>) {
    super(data);
  }
}

export interface WithdrawalRelations {
  // describe navigational properties here
}

export type WithdrawalWithRelations = Withdrawal & WithdrawalRelations;
