import {Entity, model, property} from '@loopback/repository';

@model()
export class Affiliate extends Entity {
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
    type: 'number',
  })
  week?: number;

  @property({
    type: 'number',
  })
  month?: number;

  @property({
    type: 'number',
  })
  year?: number;

  @property({
    type: 'string',
    default: "",
  })
  type?: string;

  @property({
    type: 'string',
    enum: ['WEEKLY-VOLUME', 'MONTHLY-VOLUME', 'WEEKLY-COMMISSION', 'MONTHLY-COMMISSION']
  })
  affiliateType?: 'WEEKLY-VOLUME' | 'MONTHLY-VOLUME' | 'WEEKLY-COMMISSION' | 'MONTHLY-COMMISSION';

  @property({
    type: 'number',
    default: 0,
  })
  amount?: number;

  @property({
    type: 'string',
    default: "",
  })
  coinCode?: string;

  @property({
    type: 'string',
    default: "",
  })
  note?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  paid?: boolean;

  @property({
    type: 'number',
    default: 0,
  })
  casinoPv?: number;

  @property({
    type: 'number',
    default: 0,
  })
  casinoPgv?: number;

  @property({
    type: 'number',
    default: 0,
  })
  casinoLevel?: number;

  @property({
    type: 'number',
    default: 0,
  })
  createdAt?: number;


  @property({
    type: 'string',
  })
  investId?: string;

  @property({
    type: 'string',
  })
  package?: string;

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
    type: 'string',
    default: '',
  })
  iType?: string;

  @property({
    type: 'string',
    default: '',
  })
  pgv?: string;

  @property({
    type: 'string',
    default: '',
  })
  pgvPercent?: string;

  @property({
    type: 'string',
    default: '',
  })
  amountUsd?: string;

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

  constructor(data?: Partial<Affiliate>) {
    super(data);
  }
}

export interface AffiliateRelations {
  // describe navigational properties here
}

export type AffiliateWithRelations = Affiliate & AffiliateRelations;
