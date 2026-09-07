import { rateLimit } from '../rate-limit';

describe('rateLimit', () => {
  test('allows up to limit then blocks', () => {
    const key = `test:${Math.random()}`;
    const opts = { limit: 3, windowMs: 60_000 };
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(false);
  });

  test('isolates per key', () => {
    const a = `a:${Math.random()}`;
    const b = `b:${Math.random()}`;
    const opts = { limit: 1, windowMs: 60_000 };
    expect(rateLimit(a, opts).ok).toBe(true);
    expect(rateLimit(b, opts).ok).toBe(true);
    expect(rateLimit(a, opts).ok).toBe(false);
  });
});
