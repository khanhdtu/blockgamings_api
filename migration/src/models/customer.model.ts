import {Entity, model, property} from '@loopback/repository';
@model({
  settings: {
    mongodb: {
      collection: 'trade.Customer',
    },
  },
})
export class Customer extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
  })
  ID?: string;

  @property({
    type: 'string',
  })
  FullName?: string;

  @property({
    type: 'string',
  })
  UserName?: string;

  @property({
    type: 'string',
  })
  Sponsor?: string;

  @property({
    type: 'string',
  })
  Password?: string;

  @property({
    type: 'string',
  })
  PasswordSalt?: string;

  @property({
    type: 'string',
  })
  Email?: string;

  @property({
    type: 'string',
  })
  IntroducerID?: string;

  @property({
    type: 'string',
  })
  ListIntroducerIDs?: string;

  @property({
    type: 'string',
  })
  GoogleScret?: string;

  @property({
    type: 'boolean',
  })
  IsGoogle2FA?: boolean;

  @property({
    type: 'boolean',
  })
  IsMasterAccount?: boolean;

  @property({
    type: 'boolean',
  })
  IsAdmin?: boolean;

  @property({
    type: 'boolean',
  })
  IsLocked?: boolean;

  @property({
    type: 'boolean',
  })
  IsDeposited?: boolean;

  @property({
    type: 'boolean',
  })
  IsDeleted?: boolean;

  @property({
    type: 'string',
  })
  CreatedOnUtc?: string;

  @property({
    type: 'string',
  })
  LastLoginDateUtc?: string;

  @property({
    type: 'number',
  })
  Time?: number;

  @property({
    type: 'number',
  })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  time_modified?: number;

  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

export interface CustomerRelations {
  // describe navigational properties here
}

export type CustomerWithRelations = Customer & CustomerRelations;
