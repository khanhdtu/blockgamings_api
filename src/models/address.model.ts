import {Entity, model, property} from '@loopback/repository';

@model()
export class Address extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  address: string;

  @property({
    type: 'string',
    required: true,
  })
  userId: string;

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
  tokenCode?: string;

  @property({
    type: 'string',
    required: false,
    default: 'payus'
  })
  server: string;

  @property({
    type: 'number',
    default: 0
  })
  status: number;

  @property({
    type: 'string',
    required: false,
    default: 0
  })
  createdAt: number;

  @property({
    type: 'number',
    required: false,
    default: 0
  })
  updatedAt: number;

  constructor(data?: Partial<Address>) {
    super(data);
  }
}

export interface AddressRelations {
  // describe navigational properties here
}

export type AddressWithRelations = Address & AddressRelations;
