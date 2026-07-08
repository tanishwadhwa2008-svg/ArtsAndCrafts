import { hash, verify } from '@node-rs/argon2';

/**
 * Password hashing using Argon2id (OWASP-recommended for password storage).
 *
 * Argon2id parameters follow current OWASP guidance. `@node-rs/argon2` ships
 * prebuilt native bindings, so no compilation is required.
 */
const ARGON2_OPTIONS = {
  // 19 MiB memory, 2 iterations, parallelism 1 (OWASP baseline).
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2_OPTIONS);
}

export async function verifyPassword(hashValue: string, plain: string): Promise<boolean> {
  try {
    return await verify(hashValue, plain);
  } catch {
    // Malformed hash — treat as a failed verification rather than throwing.
    return false;
  }
}
