import {Model, model, property} from '@loopback/repository';

@model()
class Envelope extends Model {
  @property({
    type: 'string',
  })
  from: string;

  @property({
    type: 'string',
  })
  to: string;

  constructor(data?: Partial<Envelope>) {
    super(data);
  }
}

@model()
export class Email extends Model {
  @property.array({
    type: 'string',
  })
  accepted: string[];

  @property.array({
    type: 'string',
    required: true,
  })
  rejected: string[];

  @property({
    type: 'number',
  })
  envelopeTime: number;

  @property({
    type: 'number',
  })
  messageTime: number;

  @property({
    type: 'number',
  })
  messageSize: number;

  @property({
    type: 'string',
  })
  response: string;

  @property(() => Envelope)
  envelope: Envelope;

  @property({
    type: 'string',
  })
  messageId: string;

  constructor(data?: Partial<Email>) {
    super(data);
  }
}

@model()
export class EmailTemplate extends Model {
  @property({
    type: 'string',
  })
  from = 'no_reply@loopback.io';

  @property({
    type: 'string',
    required: true,
  })
  to: string;

  @property({
    type: 'string',
    required: true,
  })
  subject: string;

  @property({
    type: 'string',
    required: true,
  })
  text: string;

  @property({
    type: 'string',
    required: true,
  })
  html: string;

  constructor(data?: Partial<EmailTemplate>) {
    super(data);
  }
}
