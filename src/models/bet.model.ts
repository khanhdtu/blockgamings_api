import {Entity, model, property} from '@loopback/repository';

@model()
export class Bet extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
  })
  username?: string;

  @property({
    type: 'string',
    enum: ['credit', 'debit']
  })
  type?: 'credit' | 'debit';

  @property({
    type: 'number',
  })
  balance?: number;

  @property({
    type: 'number',
  })
  amount?: number;

  @property({
    type: 'string',
  })
  currency?: string;

  @property({
    type: 'string',
    default: ''
  })
  gameId?: string;

  @property({
    type: 'string',
    default: '',
  })
  system?: string;

  @property({
    type: 'boolean',
  })
  refunded?: boolean;

  @property({
    type: 'number',
  })
  createdAt?: number;

  constructor(data?: Partial<Bet>) {
    super(data);
  }
}

export interface BetRelations {
  // describe navigational properties here
}

export type BetWithRelations = Bet & BetRelations;
