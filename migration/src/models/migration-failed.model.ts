import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class MigrationFailed extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
  })
  model: string;

  @property({
    type: 'string',
  })
  errorCode?: string;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<MigrationFailed>) {
    super(data);
  }
}

export interface MigrationFailedRelations {
  // describe navigational properties here
}

export type MigrationFailedWithRelations = MigrationFailed &
  MigrationFailedRelations;
