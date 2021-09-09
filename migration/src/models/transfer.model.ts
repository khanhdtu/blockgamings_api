/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    mongodb: {
      collection: 'trade.WalletsTransfers',
    },
  },
})
export class Transfer extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
  })
  code?: string;

  @property({
    type: 'string',
  })
  user_id?: string;

  @property({
    type: 'string',
  })
  user_name?: string;

  @property({
    type: 'number',
  })
  balance?: number;

  @property({
    type: 'number',
  })
  r_user_id?: number;

  @property({
    type: 'string',
  })
  r_user_name?: string;

  @property({
    type: 'number',
  })
  r_balance?: number;

  @property({
    type: 'string',
  })
  coin?: string;

  @property({
    type: 'number',
  })
  amount?: number;

  @property({
    type: 'number',
  })
  r_amount?: number;

  @property({
    type: 'number',
  })
  fee?: number;

  @property({
    type: 'boolean',
  })
  out_status?: boolean;

  @property({
    type: 'boolean',
  })
  in_status?: boolean;

  @property({
    type: 'number',
  })
  time?: number;

  @property({
    type: 'number',
  })
  status?: number;

  @property({
    type: 'string',
  })
  created_at?: string;

  @property({
    type: 'string',
  })
  updated_at?: string;

  constructor(data?: Partial<Transfer>) {
    super(data);
  }
}

export interface TransferRelations {
  // describe navigational properties here
}

export type TransferWithRelations = Transfer & TransferRelations;
