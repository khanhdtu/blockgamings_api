/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    mongodb: {
      collection: 'trade.WalletsAddresses',
    },
  },
})
export class Address extends Entity {
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
  address?: string;

  @property({
    type: 'string',
  })
  coin?: string;

  @property({
    type: 'string',
  })
  server?: string;

  @property({
    type: 'string',
  })
  time_created?: string;

  @property({
    type: 'string',
  })
  time_modified?: string;

  @property({
    type: 'number',
  })
  status: number;

  @property({
    type: 'string',
  })
  time: number;

  constructor(data?: Partial<Address>) {
    super(data);
  }
}

export interface AddressRelations {
  // describe navigational properties here
}

export type AddressWithRelations = Address & AddressRelations;
