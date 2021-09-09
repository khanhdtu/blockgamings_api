/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    mongodb: {
      collection: 'affiliate.casino_weekly_volume',
    },
  },
})
export class AffilicateWeekly extends Entity {
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
    type: 'number',
    required: true,
  })
  week: number;

  @property({
    type: 'number',
    default: 0,
  })
  month?: number;

  @property({
    type: 'number',
    default: 0,
  })
  year?: number;

  @property({
    type: 'number',
    default: 0,
  })
  casino_pv: number;

  @property({
    type: 'number',
    default: 0,
  })
  casino_pgv?: number;

  @property({
    type: 'number',
    default: 0,
  })
  casino_level?: number;

  @property({
    type: 'number',
    default: 0,
  })
  created_time?: number;

  @property({
    type: 'number',
    default: 0,
  })
  updated_time?: number;

  constructor(data?: Partial<AffilicateWeekly>) {
    super(data);
  }
}

export interface AffilicateWeeklyRelations {
  // describe navigational properties here
}

export type AffilicateWeeklyWithRelations = AffilicateWeekly &
  AffilicateWeeklyRelations;
