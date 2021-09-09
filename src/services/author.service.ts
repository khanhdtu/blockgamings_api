import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
} from '@loopback/authorization';
import {securityId, UserProfile} from '@loopback/security';
import _ from 'lodash';

// Instance level authorizer
// Can be also registered as an authorizer, depends on users' need.
export async function author(
  authorizationCtx: AuthorizationContext,
  metadata: AuthorizationMetadata,
): Promise<AuthorizationDecision> {
  // No access if authorization details are missing
  let currentUser: UserProfile;
  if (authorizationCtx.principals.length > 0) {
    const user = _.pick(authorizationCtx.principals[0], [
      'id',
      'name',
      'roles',
    ]);
    currentUser = {[securityId]: user.id, name: user.name, roles: user.roles};
  } else {
    return AuthorizationDecision.DENY;
  }

  if (currentUser.roles.includes('ROLE_ADMIN')) {
    return AuthorizationDecision.ALLOW;
  }

  if (!metadata.allowedRoles) {
    return AuthorizationDecision.ALLOW;
  }

  if (!currentUser.roles || !currentUser.roles.length) {
    return AuthorizationDecision.DENY;
  }

  let roleIsAllowed = false;
  for (const role of currentUser.roles) {
    if (metadata.allowedRoles.includes(role)) {
      roleIsAllowed = true;
      break;
    }
  }

  if (!roleIsAllowed) {
    return AuthorizationDecision.DENY;
  } else {
    return AuthorizationDecision.ALLOW;
  }
}
