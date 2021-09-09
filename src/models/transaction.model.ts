import {Entity, model, property} from '@loopback/repository';

@model()
export class Transaction extends Entity {
  @property({
    type: "string",
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: "string",
    required: true,
  })
  code: string;

  @property({
    type: "string",
    required: true,
  })
  userId: string;

  @property({
    type: "string",
    required: true,
  })
  username: string;

  @property({
    type: "string",
    required: true,
  })
  coinCode: string;

  @property({
    type: "number",
    default: 0,
  })
  fee: number;

  @property({
    type: "number",
    required: true,
  })
  amount: number;

  @property({
    type: "number",
    required: true,
  })
  amountUsdt: number;

  @property({
    type: "string",
    default: 'payus'
  })
  payment: string;

  @property({
    type: "string",
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELED'],
    default: 'PROCESSING'
  })
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELED';

  @property({
    type: "string",
    enum: ['WITHDRAWAL', 'DEPOSIT', 'TRANSFER', 'CONVERT', 'BUY', 'SELL'],
    default: 'WITHDRAWAL'
  })
  type: 'WITHDRAWAL' | 'DEPOSIT' | 'TRANSFER' | 'CONVERT' | 'BUY' | 'SELL';

  @property({
    type: "string",
    default: "",
  })
  toCoindCode?: string;

  @property({
    type: "string",
    default: "",
  })
  toUsername?: string;

  @property({
    type: "string",
    default: "",
  })
  tokenCode?: string;

  @property({
    type: "string",
    default: "",
  })
  txid?: string;

  @property({
    type: "string",
    default: "",
  })
  address?: string;

  @property({
    type: "string",
    default: "",
  })
  g2faCode?: string;

  @property({
    type: "number",
    default: 0
  })
  createdAt: number;

  constructor(data?: Partial<Transaction>) {
    super(data);
  }
}

export interface TransactionRelations {
  // describe navigational properties here
}

export type TransactionWithRelations = Transaction & TransactionRelations;
