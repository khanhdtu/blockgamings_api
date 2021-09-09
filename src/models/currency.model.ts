import {Entity, model, property} from '@loopback/repository';

@model()
export class Currency extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id?: string;

  @property({
    type: 'string',
    default: ''
  })
  coinAddress?: string;

  @property({
    type: 'string',
    default: ''
  })
  destinationTag?: string;

  @property({
    type: 'string',
    required: true,
  })
  coinCode: string;

  @property({
    type: 'string',
    required: true,
  })
  coinName: string;

  @property({
    type: 'string',
    required: true,
  })
  tokenName: string;

  @property({
    type: 'string',
    required: true,
  })
  tokenCode: string;

  @property({
    type: 'string',
  })
  currency: string;

  @property({
    type: 'string',
  })
  symbol: string;

  @property({
    type: 'boolean',
    default: false,
  })
  withdraw?: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  deposit?: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  transfer?: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  convert?: boolean;

  @property({
    type: 'boolean',
    default: true,
  })
  status?: boolean;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'number',
  })
  order: number;

  @property({
    type: 'number',
    default: 0,
  })
  updatedAt?: number;

  @property({
    type: 'string',
    default: '',
  })
  createdAt?: string;

  constructor(data?: Partial<Currency>) {
    super(data);
  }
}

export interface CurrencyRelations {
  // describe navigational properties here
}

export type CurrencyWithRelations = Currency & CurrencyRelations;
