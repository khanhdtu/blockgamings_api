/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AuthenticationStrategy,
  AuthenticationMetadata,
  AuthenticationBindings,
} from '@loopback/authentication';
import {Getter, inject } from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {MESSAGE} from '../constants';

export class DomainAuthenticationStrategy implements AuthenticationStrategy {
  name = 'authen-domain';

  constructor(
    @inject.getter(AuthenticationBindings.METADATA)
    readonly getMetaData: Getter<AuthenticationMetadata>,
  ) {}

  async authenticate(req: Request | any): Promise<UserProfile | any> {
    const whiteListIPs = process.env.WHITE_LIST_IP?.split(',') ?? []
    const requestIP = req.connection.remoteAddress.replace('::ffff:', '')
    console.log('requestIP', requestIP)
    if (!whiteListIPs.includes(requestIP)) {
      throw new HttpErrors.Forbidden(MESSAGE.DOMAIN_INVALID)
    }
    const userProfile: UserProfile = Object.assign(
      {[securityId]: '', name: ''},
      {
        [securityId]: 'SUPER_ADMIN',
        id: 'SUPER_ADMIN',
        name: 'SUPER_ADMIN',
        roles: ['ROLE_ADMIN'],
      },
    );
    return userProfile;
  }
}
