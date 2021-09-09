import {SchemaObject} from '@loopback/rest';

export const UserProfileSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: {type: 'string'},
    email: {type: 'string'},
    username: {type: 'string'},
  },
};

const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['user_name','email', 'password'],
  properties: {
    'user_name': {
        type: 'string',
        minLength: 6,
    },
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

export const PasswordResetRequestBody = {
  description: 'The input of password reset function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};
