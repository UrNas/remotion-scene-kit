import type { CSSProperties, ReactNode } from 'react';
import { mergeTheme, tokens, type Tokens } from '../tokens';

export interface TerminalFrameProps {
  title?: string;
  width?: number | string;
  height?: number | string;
  theme?: Partial<Tokens>;
  padding?: number;
  children: ReactNode;
}

const TITLE_BAR_HEIGHT = 28;
const DOT_SIZE = 12;

export function TerminalFrame({
  title = 'Terminal',
  width = '100%',
  height = '100%',
  theme,
  padding,
  children,
}: TerminalFrameProps) {
  const t = mergeTheme(tokens, theme);
  const bodyPadding = padding ?? t.spacing.md;

  const containerStyle: CSSProperties = {
    width,
    height,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: t.radii.lg,
    overflow: 'hidden',
    backgroundColor: t.colors.bgTerminalDark,
    border: `1px solid ${t.colors.border}`,
    fontFamily: t.fonts.mono,
    color: t.colors.fg,
    boxSizing: 'border-box',
  };

  const titleBarStyle: CSSProperties = {
    position: 'relative',
    height: TITLE_BAR_HEIGHT,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderBottom: `1px solid ${t.colors.border}`,
  };

  const dotsStyle: CSSProperties = {
    position: 'absolute',
    left: t.spacing.md,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  const titleStyle: CSSProperties = {
    flex: 1,
    textAlign: 'center',
    fontSize: t.fontSize.sm,
    color: t.colors.fgMuted,
    fontFamily: t.fonts.sans,
    letterSpacing: 0.2,
  };

  const bodyStyle: CSSProperties = {
    flex: 1,
    minHeight: 0,
    padding: bodyPadding,
    overflow: 'hidden',
    boxSizing: 'border-box',
  };

  return (
    <div style={containerStyle}>
      <div style={titleBarStyle}>
        <div style={dotsStyle}>
          <span style={dotStyle(t.colors.trafficRed)} />
          <span style={dotStyle(t.colors.trafficYellow)} />
          <span style={dotStyle(t.colors.trafficGreen)} />
        </div>
        <div style={titleStyle}>{title}</div>
      </div>
      <div style={bodyStyle}>{children}</div>
    </div>
  );
}

function dotStyle(color: string): CSSProperties {
  return {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: '50%',
    backgroundColor: color,
    display: 'inline-block',
  };
}
