/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AuthenticationStrategy,
  AuthenticationMetadata,
  AuthenticationBindings,
} from '@loopback/authentication';
import {Getter, inject } from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {KeyBindings} from '../keys';
import {UserManagementService} from './user.service';

export class BasicAuthenticationStrategy implements AuthenticationStrategy {
  name = 'authen';

  constructor(
    @inject.getter(AuthenticationBindings.METADATA)
    readonly getMetaData: Getter<AuthenticationMetadata>,

    @inject(KeyBindings.USER_SERVICE)
    private userManagementService: UserManagementService,
  ) {}

  async authenticate(req: Request | any): Promise<UserProfile | undefined | any > {
    const token = req.headers['token'] as string;
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : 'token' is empty`,
      );
    }

    const credentials = this.userManagementService.verifyToken(token);
    if (!credentials.isValid) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : 'token' is expired`,
      );
    }

    const userProfile: UserProfile = Object.assign(
      {[securityId]: '', name: ''},
      {
        [securityId]: credentials.id,
        id: credentials.id,
        name: credentials.username ?? credentials.email,
        roles: [credentials.role],
      },
    );
    return userProfile;
  }
}
