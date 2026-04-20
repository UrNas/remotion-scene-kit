import { describe, expect, it } from 'vitest';
import { mergeTheme, tokens } from '../src/tokens';

describe('mergeTheme', () => {
  it('returns defaults unchanged when override is undefined', () => {
    expect(mergeTheme(tokens)).toEqual(tokens);
    expect(mergeTheme(tokens, undefined)).toEqual(tokens);
  });

  it('shallow-merges within a category, leaving siblings intact', () => {
    const result = mergeTheme(tokens, {
      colors: { border: '#000000' },
    } as never);
    expect(result.colors.border).toBe('#000000');
    expect(result.colors.bgTerminalDark).toBe(tokens.colors.bgTerminalDark);
    expect(result.colors.accentAdd).toBe(tokens.colors.accentAdd);
    expect(result.colors.trafficRed).toBe(tokens.colors.trafficRed);
  });

  it('leaves other categories untouched when one is overridden', () => {
    const result = mergeTheme(tokens, {
      spacing: { md: 20 },
    } as never);
    expect(result.spacing.md).toBe(20);
    expect(result.spacing.sm).toBe(tokens.spacing.sm);
    expect(result.spacing.xl).toBe(tokens.spacing.xl);
    expect(result.colors).toEqual(tokens.colors);
    expect(result.fonts).toEqual(tokens.fonts);
  });

  it('merges multiple categories at once', () => {
    const result = mergeTheme(tokens, {
      colors: { fg: '#abcdef' },
      fontSize: { md: 18 },
    } as never);
    expect(result.colors.fg).toBe('#abcdef');
    expect(result.fontSize.md).toBe(18);
    expect(result.colors.fgMuted).toBe(tokens.colors.fgMuted);
    expect(result.fontSize.sm).toBe(tokens.fontSize.sm);
  });

  it('does not mutate the defaults object', () => {
    const snapshot = JSON.parse(JSON.stringify(tokens));
    mergeTheme(tokens, { colors: { border: '#ff0000' } } as never);
    expect(tokens).toEqual(snapshot);
  });
});
