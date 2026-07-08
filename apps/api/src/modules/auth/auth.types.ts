import type { Role } from '@arts/shared';

/** The authenticated principal attached to `req.user` by `requireAuth`. */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  shopId: string | null;
  displayName: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
}

export interface AuthResult {
  user: AuthUser;
  tokens: AuthTokens;
}
