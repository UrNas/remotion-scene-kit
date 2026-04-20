import type { CSSProperties, ReactNode } from 'react';
import { tokens } from '../tokens';

export type ToolCallStatus = 'running' | 'done' | 'error';

export interface ToolCallBlockProps {
  label: string;
  detail?: string;
  status?: ToolCallStatus;
  children?: ReactNode;
  style?: CSSProperties;
}

const STATUS_COLOR: Record<ToolCallStatus, string> = {
  running: tokens.colors.trafficYellow,
  done: tokens.colors.accentAdd,
  error: tokens.colors.accentRemove,
};

export function ToolCallBlock({
  label,
  detail,
  status = 'done',
  children,
  style,
}: ToolCallBlockProps) {
  const containerStyle: CSSProperties = {
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.radii.md,
    fontFamily: tokens.fonts.mono,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.fg,
    overflow: 'hidden',
    boxSizing: 'border-box',
    ...style,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
  };

  const labelStyle: CSSProperties = {
    fontWeight: 600,
    color: tokens.colors.fg,
    flexShrink: 0,
  };

  const detailStyle: CSSProperties = {
    color: tokens.colors.fgMuted,
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const dotStyle: CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: STATUS_COLOR[status],
    flexShrink: 0,
    marginLeft: 'auto',
  };

  const separatorStyle: CSSProperties = {
    height: 1,
    backgroundColor: tokens.colors.border,
  };

  const bodyStyle: CSSProperties = {
    padding: tokens.spacing.md,
    whiteSpace: 'pre-wrap',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={labelStyle}>{label}</span>
        {detail ? <span style={detailStyle}>{detail}</span> : null}
        <span style={dotStyle} />
      </div>
      {children ? (
        <>
          <div style={separatorStyle} />
          <div style={bodyStyle}>{children}</div>
        </>
      ) : null}
    </div>
  );
}
