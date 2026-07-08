/**
 * Role-based access control primitives.
 *
 * Phase 1 only uses SELLER / ADMIN, but CUSTOMER and WHOLESALE are declared
 * now so future apps can be added without a breaking migration.
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  SELLER: 'SELLER',
  CUSTOMER: 'CUSTOMER',
  WHOLESALE: 'WHOLESALE',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: readonly Role[] = Object.values(ROLES);
