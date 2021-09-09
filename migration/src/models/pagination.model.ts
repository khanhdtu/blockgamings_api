import {Entity, model, property} from '@loopback/repository';

@model()
export class Pagination extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    default: '',
  })
  name?: string;

  constructor(data?: Partial<Pagination>) {
    super(data);
  }
}

export interface PaginationRelations {
  // describe navigational properties here
}

export type PaginationWithRelations = Pagination & PaginationRelations;
