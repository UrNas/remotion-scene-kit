import type { CSSProperties } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useCharReveal } from '../internal/useCharReveal';

export interface StreamingTextProps {
  text: string;
  startFrame?: number;
  charsPerSecond?: number;
  jitter?: number;
  seed?: number;
  cursor?: boolean;
  style?: CSSProperties;
}

export function StreamingText({
  text,
  startFrame = 0,
  charsPerSecond = 40,
  jitter = 0.2,
  seed = 1,
  cursor = true,
  style,
}: StreamingTextProps) {
  const visible = useCharReveal({
    text,
    startFrame,
    charsPerSecond,
    jitter,
    seed,
  });
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const revealed = text.slice(0, visible);
  const halfBlink = Math.max(1, Math.round(fps * 0.5));
  const cursorOn = Math.floor(Math.max(0, frame) / halfBlink) % 2 === 0;

  const cursorStyle: CSSProperties = {
    display: 'inline-block',
    width: '0.55em',
    height: '1.05em',
    verticalAlign: 'text-bottom',
    backgroundColor: cursorOn ? 'currentColor' : 'transparent',
    marginLeft: 1,
  };

  return (
    <span style={{ whiteSpace: 'pre-wrap', ...style }}>
      {revealed}
      {cursor ? <span style={cursorStyle} /> : null}
    </span>
  );
}
