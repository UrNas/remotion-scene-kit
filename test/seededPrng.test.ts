import { describe, expect, it } from 'vitest';
import { seededPrng } from '../src/internal/seededPrng';

function sample(rng: () => number, n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(rng());
  return out;
}

describe('seededPrng', () => {
  it('produces the same sequence for the same seed', () => {
    expect(sample(seededPrng(42), 8)).toEqual(sample(seededPrng(42), 8));
    expect(sample(seededPrng(0), 8)).toEqual(sample(seededPrng(0), 8));
  });

  it('produces different sequences for different seeds', () => {
    const a = sample(seededPrng(1), 8);
    const b = sample(seededPrng(2), 8);
    expect(a).not.toEqual(b);
  });

  it('yields values in [0, 1)', () => {
    const rng = seededPrng(7);
    for (let i = 0; i < 2000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('does not get stuck at a single value', () => {
    const values = new Set(sample(seededPrng(123), 50));
    expect(values.size).toBeGreaterThan(40);
  });
});
