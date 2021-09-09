import {Entity, model, property} from '@loopback/repository';
@model({
  settings: {
    mongodb: {
      collection: 'trade.WalletsCoins',
    },
  },
})
export class Coin extends Entity {
    @property({
        type: 'string',
        id: true,
    })
    _id?: string;

    @property({
        type: 'string',
    })
    coin_address: string;

    @property({
        type: 'string',
    })
    destination_tag: string;

    @property({
        type: 'string',
    })
    coin_name: string;

    @property({
        type: 'string',
    })
    coin_code: string;

    @property({
        type: 'boolean',
    })
    status: boolean;

    @property({
        type: 'string',
    })
    token: string;

    @property({
        type: 'string',
    })
    token_name: string;

    @property({
        type: 'string',
    })
    symbol: string;

    @property({
        type: 'boolean',
    })
    withdraw: boolean;

    @property({
        type: 'boolean',
    })
    convert: boolean;

    @property({
        type: 'boolean',
    })
    transfer: boolean;

    @property({
        type: 'number',
    })
    order: number;
}

export interface CoinRelations {
    // describe navigational properties here
}

export type CoinWithRelations = Coin & CoinRelations;
