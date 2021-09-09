import {Entity, model, property} from '@loopback/repository';

@model()
export class Migration extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  model: string;

  @property({
    type: 'number',
    default: 0,
  })
  migratedAt?: number;

  @property({
    type: 'boolean',
    default: false,
  })
  completed?: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  locked: boolean;

  @property({
    type: 'number',
    default: 0,
  })
  totalMigrated: number;

  constructor(data?: Partial<Migration>) {
    super(data);
  }
}

export interface MigrationRelations {
  // describe navigational properties here
}

export type MigrationWithRelations = Migration & MigrationRelations;
