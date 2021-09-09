/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    mongodb: {
      collection: 'trade.WalletsAccounts',
    },
  },
})
export class Wallet extends Entity {
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
  coin?: string;

  @property({
    type: 'number',
    default: 0,
  })
  balance?: number;

  @property({
    type: 'number',
    default: 0,
  })
  status?: number;

  @property({
    type: 'string',
  })
  time_created?: string;

  @property({
    type: 'number',
  })
  time_modified?: number;

  @property({
    type: 'number',
  })
  time?: number;

  constructor(data?: Partial<Wallet>) {
    super(data);
  }
}

export interface WalletRelations {
  // describe navigational properties here
}

export type WalletWithRelations = Wallet & WalletRelations;
