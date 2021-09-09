/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    mongodb: {
      collection: 'trade.Commissions',
    },
  },
})
export class AffiliateCommission extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
  })
  user_name: string;

  @property({
    type: 'string',
  })
  invest_id?: string;

  @property({
    type: 'string',
  })
  package_name?: string;

  @property({
    type: 'string',
  })
  note?: string;

  @property({
    type: 'string',
  })
  desc?: string;

  @property({
    type: 'string',
  })
  title?: string;

  @property({
    type: 'string',
  })
  coin?: string;

  @property({
    type: 'number',
    default: 0,
  })
  year?: number;

  @property({
    type: 'number',
    default: 0,
  })
  month?: number;

  @property({
    type: 'number',
    required: true,
  })
  week?: number;

  @property({
    type: 'string',
    default: '',
  })
  type?: string;

  @property({
    type: 'string',
    default: '',
  })
  i_type?: string;

  @property({
    type: 'string',
    default: '',
  })
  pgv?: string;

  @property({
    type: 'string',
    default: '',
  })
  pgv_percent?: string;

  @property({
    type: 'number',
    default: 0,
  })
  amount?: number;

  @property({
    type: 'string',
    default: '',
  })
  amount_usd?: string;

  @property({
    type: 'number',
    default: 0,
  })
  rate?: number;

  @property({
    type: 'number',
    default: 0,
  })
  interest?: number;

  @property({
    type: 'number',
    default: 0,
  })
  status?: number;

  @property({
    type: 'number',
    default: 0,
  })
  count?: number;

  @property({
    type: 'number',
    default: 0,
  })
  time?: number;

  constructor(data?: Partial<AffiliateCommission>) {
    super(data);
  }
}

export interface AffilicateCommissionRelations {
  // describe navigational properties here
}

export type AffilicateCommissionWithRelations = AffiliateCommission &
  AffilicateCommissionRelations;
