import type { CSSProperties } from 'react';
import { tokens } from '../tokens';

export type DiffLineType = 'add' | 'remove' | 'context';

export interface DiffLine {
  type: DiffLineType;
  text: string;
}

export interface DiffBlockProps {
  lines: DiffLine[];
  showLineNumbers?: boolean;
  style?: CSSProperties;
}

const BG: Record<DiffLineType, string> = {
  add: 'rgba(63, 185, 80, 0.15)',
  remove: 'rgba(248, 81, 73, 0.15)',
  context: 'transparent',
};

const FG: Record<DiffLineType, string> = {
  add: tokens.colors.accentAdd,
  remove: tokens.colors.accentRemove,
  context: tokens.colors.fg,
};

const PREFIX: Record<DiffLineType, string> = {
  add: '+',
  remove: '-',
  context: ' ',
};

export function DiffBlock({
  lines,
  showLineNumbers = true,
  style,
}: DiffBlockProps) {
  const containerStyle: CSSProperties = {
    fontFamily: tokens.fonts.mono,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.fg,
    borderRadius: tokens.radii.md,
    overflow: 'hidden',
    border: `1px solid ${tokens.colors.border}`,
    boxSizing: 'border-box',
    ...style,
  };

  const gutterStyle: CSSProperties = {
    width: 44,
    padding: `2px ${tokens.spacing.sm}px`,
    textAlign: 'right',
    color: tokens.colors.fgMuted,
    borderRight: `1px solid ${tokens.colors.border}`,
    flexShrink: 0,
    userSelect: 'none',
  };

  const prefixStyle: CSSProperties = {
    width: 22,
    padding: `2px 0`,
    textAlign: 'center',
    flexShrink: 0,
    fontWeight: 600,
  };

  const textStyle: CSSProperties = {
    padding: `2px ${tokens.spacing.sm}px`,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    flex: 1,
    minWidth: 0,
  };

  return (
    <div style={containerStyle}>
      {lines.map((line, i) => {
        const rowStyle: CSSProperties = {
          display: 'flex',
          alignItems: 'flex-start',
          backgroundColor: BG[line.type],
          color: FG[line.type],
        };
        return (
          <div key={i} style={rowStyle}>
            {showLineNumbers ? <span style={gutterStyle}>{i + 1}</span> : null}
            <span style={prefixStyle}>{PREFIX[line.type]}</span>
            <span style={textStyle}>{line.text}</span>
          </div>
        );
      })}
    </div>
  );
}
