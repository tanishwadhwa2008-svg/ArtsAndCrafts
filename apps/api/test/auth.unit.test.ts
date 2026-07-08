import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../src/lib/password.js';
import { signAccessToken, verifyAccessToken } from '../src/lib/jwt.js';
import { generateRefreshToken, hashRefreshToken, safeEqual } from '../src/lib/refresh-token.js';

describe('password hashing', () => {
  it('hashes and verifies a correct password', async () => {
    const hash = await hashPassword('Str0ngPassw0rd!');
    expect(hash).not.toContain('Str0ngPassw0rd');
    expect(await verifyPassword(hash, 'Str0ngPassw0rd!')).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('Str0ngPassw0rd!');
    expect(await verifyPassword(hash, 'WrongPassw0rd!')).toBe(false);
  });

  it('does not throw on a malformed hash', async () => {
    expect(await verifyPassword('not-a-hash', 'whatever')).toBe(false);
  });
});

describe('access token', () => {
  it('signs and verifies claims', async () => {
    const token = await signAccessToken({
      sub: 'user-1',
      role: 'SELLER',
      shopId: 'shop-1',
      email: 'a@b.co',
    });
    const claims = await verifyAccessToken(token);
    expect(claims.sub).toBe('user-1');
    expect(claims.role).toBe('SELLER');
    expect(claims.shopId).toBe('shop-1');
    expect(claims.email).toBe('a@b.co');
  });

  it('rejects a tampered/invalid token', async () => {
    await expect(verifyAccessToken('bad.token.value')).rejects.toBeDefined();
  });
});

describe('refresh token', () => {
  it('produces a deterministic keyed hash', () => {
    const { token, tokenHash } = generateRefreshToken();
    expect(hashRefreshToken(token)).toBe(tokenHash);
  });

  it('safeEqual compares in constant time', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
  });
});
