import type { CSSProperties, ReactNode } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { mergeTheme, tokens, type Tokens } from '../tokens';

export interface BrowserFrameProps {
  url?: string;
  title?: string;
  showTabs?: boolean;
  viewport?: 'desktop' | 'mobile';
  width?: number | string;
  height?: number | string;
  reloadAtFrame?: number;
  theme?: Partial<Tokens>;
  children: ReactNode;
}

const TITLE_BAR_HEIGHT = 28;
const TABS_HEIGHT = 36;
const URL_BAR_HEIGHT = 40;
const MOBILE_URL_BAR_HEIGHT = 44;
const MOBILE_INNER_WIDTH = 420;
const DOT_SIZE = 12;
const LOADING_BAR_COLOR = '#3B82F6';

function dotStyle(color: string): CSSProperties {
  return {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: '50%',
    backgroundColor: color,
    display: 'inline-block',
  };
}

export function BrowserFrame({
  url = 'https://example.com',
  title = 'New Tab',
  showTabs = true,
  viewport = 'desktop',
  width = '100%',
  height = '100%',
  reloadAtFrame,
  theme,
  children,
}: BrowserFrameProps) {
  const t = mergeTheme(tokens, theme);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isReloading = reloadAtFrame != null;
  const sinceReload = isReloading
    ? frame - (reloadAtFrame as number)
    : Number.NEGATIVE_INFINITY;
  const sweepDuration = Math.round(fps * 0.8);
  const flashDuration = Math.round(fps * 0.35);

  const sweepWidthPct =
    isReloading && sinceReload >= 0
      ? interpolate(sinceReload, [0, sweepDuration], [0, 100], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 0;
  const sweepAlpha =
    isReloading && sinceReload >= 0
      ? interpolate(
          sinceReload,
          [0, sweepDuration * 0.85, sweepDuration * 1.15],
          [1, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        )
      : 0;
  const flashOpacity =
    isReloading && sinceReload >= 0
      ? interpolate(
          sinceReload,
          [0, flashDuration * 0.25, flashDuration],
          [0, 0.35, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        )
      : 0;

  const showSweep = isReloading && sinceReload >= 0 && sinceReload < sweepDuration * 1.15;
  const showFlash = isReloading && sinceReload >= 0 && sinceReload < flashDuration;

  const sweepNode = showSweep ? (
    <div
      style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        height: 2.5,
        width: `${sweepWidthPct}%`,
        backgroundColor: LOADING_BAR_COLOR,
        opacity: sweepAlpha,
        pointerEvents: 'none',
      }}
    />
  ) : null;

  const flashNode = showFlash ? (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'white',
        opacity: flashOpacity,
        pointerEvents: 'none',
      }}
    />
  ) : null;

  if (viewport === 'mobile') {
    const outerStyle: CSSProperties = {
      width,
      height,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'stretch',
      boxSizing: 'border-box',
    };
    const frameStyle: CSSProperties = {
      width: MOBILE_INNER_WIDTH,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: t.radii.xl,
      overflow: 'hidden',
      backgroundColor: t.colors.bgBrowserChrome,
      border: '1px solid rgba(0, 0, 0, 0.08)',
      fontFamily: t.fonts.sans,
      color: t.colors.fgInverse,
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
      boxSizing: 'border-box',
    };
    const urlBarStyle: CSSProperties = {
      height: MOBILE_URL_BAR_HEIGHT,
      padding: `0 ${t.spacing.md}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
      position: 'relative',
      flexShrink: 0,
    };
    const urlPillStyle: CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: t.spacing.xs,
      padding: `6px ${t.spacing.md}px`,
      borderRadius: 999,
      backgroundColor: 'rgba(0, 0, 0, 0.06)',
      fontSize: t.fontSize.sm,
      color: t.colors.fgInverse,
      maxWidth: '90%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };
    const pageStyle: CSSProperties = {
      flex: 1,
      minHeight: 0,
      backgroundColor: 'white',
      position: 'relative',
      overflow: 'hidden',
    };

    return (
      <div style={outerStyle}>
        <div style={frameStyle}>
          <div style={urlBarStyle}>
            <div style={urlPillStyle}>
              <span style={{ fontSize: '0.85em' }}>🔒</span>
              <span>{url}</span>
            </div>
            {sweepNode}
          </div>
          <div style={pageStyle}>
            {children}
            {flashNode}
          </div>
        </div>
      </div>
    );
  }

  const containerStyle: CSSProperties = {
    width,
    height,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: t.radii.lg,
    overflow: 'hidden',
    backgroundColor: t.colors.bgBrowserChrome,
    border: '1px solid rgba(0, 0, 0, 0.08)',
    fontFamily: t.fonts.sans,
    color: t.colors.fgInverse,
    boxSizing: 'border-box',
  };

  const titleBarStyle: CSSProperties = {
    height: TITLE_BAR_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${t.spacing.md}px`,
    flexShrink: 0,
  };

  const tabsStyle: CSSProperties = {
    height: TABS_HEIGHT,
    display: 'flex',
    alignItems: 'flex-end',
    padding: `0 ${t.spacing.md}px`,
    flexShrink: 0,
  };

  const tabStyle: CSSProperties = {
    height: TABS_HEIGHT - 6,
    padding: `0 ${t.spacing.md}px`,
    display: 'flex',
    alignItems: 'center',
    gap: t.spacing.sm,
    backgroundColor: 'white',
    borderTopLeftRadius: t.radii.md,
    borderTopRightRadius: t.radii.md,
    fontSize: t.fontSize.sm,
    color: t.colors.fgInverse,
    maxWidth: 240,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  };

  const urlBarStyle: CSSProperties = {
    height: URL_BAR_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${t.spacing.md}px`,
    gap: t.spacing.md,
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    position: 'relative',
    flexShrink: 0,
    backgroundColor: showTabs ? 'white' : 'transparent',
  };

  const navButtonsStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: t.spacing.sm,
    color: t.colors.fgMuted,
    fontSize: t.fontSize.md,
    flexShrink: 0,
  };

  const urlPillStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: t.spacing.sm,
    padding: `6px ${t.spacing.md}px`,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontSize: t.fontSize.sm,
    color: t.colors.fgInverse,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  };

  const pageStyle: CSSProperties = {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'white',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div style={containerStyle}>
      <div style={titleBarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={dotStyle(t.colors.trafficRed)} />
          <span style={dotStyle(t.colors.trafficYellow)} />
          <span style={dotStyle(t.colors.trafficGreen)} />
        </div>
      </div>
      {showTabs ? (
        <div style={tabsStyle}>
          <div style={tabStyle}>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </span>
          </div>
        </div>
      ) : null}
      <div style={urlBarStyle}>
        <div style={navButtonsStyle}>
          <span>←</span>
          <span>→</span>
          <span>↻</span>
        </div>
        <div style={urlPillStyle}>
          <span style={{ fontSize: '0.85em' }}>🔒</span>
          <span>{url}</span>
        </div>
        {sweepNode}
      </div>
      <div style={pageStyle}>
        {children}
        {flashNode}
      </div>
    </div>
  );
}
