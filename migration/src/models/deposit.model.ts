/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, model, property} from '@loopback/repository';
@model({
  settings: {
    mongodb: {
      collection: 'trade.WalletsDesposits',
    },
  },
})
export class Deposit extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

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
  coin?: string;

  @property({
    type: 'number',
    default: 0,
  })
  amount?: number;

  @property({
    type: 'number',
  })
  amount_usd?: number;

  @property({
    type: 'number',
  })
  amount_euro?: number;

  @property({
    type: 'number',
  })
  rate?: number;

  @property({
    type: 'boolean',
  })
  w_active?: boolean;

  @property({
    type: 'string',
  })
  type?: string;

  @property({
    type: 'string',
  })
  created_time?: string;

  @property({
    type: 'number',
  })
  time?: number;

  constructor(data?: Partial<Deposit>) {
    super(data);
  }
}

export interface DepositRelations {
  // describe navigational properties here
}

export type DepositWithRelations = Deposit & DepositRelations;
