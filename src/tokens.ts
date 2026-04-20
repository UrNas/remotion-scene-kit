export const tokens = {
  colors: {
    bgTerminalDark: '#1E1E1E',
    bgTerminalLight: '#FAFAFA',
    bgBrowserChrome: '#F1F3F4',
    fg: '#E6E6E6',
    fgMuted: '#9A9A9A',
    fgInverse: '#1A1A1A',
    accentAdd: '#3FB950',
    accentRemove: '#F85149',
    border: 'rgba(255, 255, 255, 0.1)',
    trafficRed: '#FF5F57',
    trafficYellow: '#FEBC2E',
    trafficGreen: '#28C840',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  radii: { sm: 4, md: 8, lg: 12, xl: 24 },
  fonts: {
    mono: 'SF Mono, Menlo, Monaco, Consolas, monospace',
    sans: '-apple-system, system-ui, sans-serif',
  },
  fontSize: { xs: 12, sm: 14, md: 16, lg: 20, xl: 28 },
} as const;

export type Tokens = typeof tokens;

export function mergeTheme(defaults: Tokens, override?: Partial<Tokens>): Tokens {
  if (!override) return defaults;
  const out = { ...defaults } as Record<keyof Tokens, unknown>;
  for (const key of Object.keys(override) as Array<keyof Tokens>) {
    const categoryOverride = override[key];
    if (categoryOverride && typeof categoryOverride === 'object') {
      out[key] = {
        ...(defaults[key] as object),
        ...(categoryOverride as object),
      };
    }
  }
  return out as Tokens;
}
