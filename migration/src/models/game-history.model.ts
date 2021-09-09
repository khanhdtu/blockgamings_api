/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    mongodb: {
      collection: 'trade.GamesHistories',
    },
  },
})
export class GameHistory extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'number',
  })
  id?: number;

  @property({
    type: 'number',
  })
  userid?: number;

  @property({
    type: 'number',
  })
  user_id?: number;

  @property({
    type: 'string',
  })
  user_name?: string;

  @property({
    type: 'string',
  })
  user_fullname?: string;

  @property({
    type: 'string',
  })
  type?: string;

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
  amount_text?: string;

  @property({
    type: 'string',
  })
  currency?: string;

  @property({
    type: 'number',
  })
  rate?: number;

  @property({
    type: 'number',
  })
  amount_lakc?: number;

  @property({
    type: 'string',
  })
  tid?: string;

  @property({
    type: 'string',
  })
  i_actionid?: string;

  @property({
    type: 'string',
  })
  i_rollback?: string;

  @property({
    type: 'string',
  })
  original_id?: string;

  @property({
    type: 'string',
  })
  i_gameid?: string;

  @property({
    type: 'string',
  })
  i_gamedesc?: string;

  @property({
    type: 'string',
  })
  system?: string;

  @property({
    type: 'string',
  })
  status?: string;

  @property({
    type: 'boolean',
  })
  refunded?: boolean;

  @property({
    type: 'boolean',
  })
  update?: boolean;

  @property({
    type: 'number',
  })
  time?: number;

  constructor(data?: Partial<GameHistory>) {
    super(data);
  }
}

export interface GameHistoryRelations {
  // describe navigational properties here
}

export type GameHistoryWithRelations = GameHistory & GameHistoryRelations;
