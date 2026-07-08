import { Prisma } from '@prisma/client';

/**
 * Money serialization convention.
 *
 * Monetary values are stored as SQL `DECIMAL` and must NEVER be exposed to
 * clients as JavaScript floats (precision loss). Every API response that
 * returns money should pass the value through `serializeMoney`, producing a
 * fixed-precision string (e.g. `"28.00"`). Feature serializers added in later
 * phases will rely on this helper so money is represented consistently across
 * the whole API.
 */
export type MoneyInput = Prisma.Decimal | number | string;

export function serializeMoney(value: MoneyInput, decimalPlaces = 2): string {
  return new Prisma.Decimal(value).toFixed(decimalPlaces);
}
