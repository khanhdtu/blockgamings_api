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
    type: 'number',
    default: 0,
  })
  userMigratedAt?: number;

  @property({
    type: 'boolean',
    default: false,
  })
  userMigrated?: boolean;

  constructor(data?: Partial<Migration>) {
    super(data);
  }
}

export interface MigrationRelations {
  // describe navigational properties here
}

export type MigrationWithRelations = Migration & MigrationRelations;
