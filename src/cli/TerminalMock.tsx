import type { CSSProperties, ReactNode } from 'react';
import { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { tokens } from '../tokens';
import { CodeBlock } from './CodeBlock';
import { DiffBlock, type DiffLine } from './DiffBlock';
import { StreamingText } from './StreamingText';
import { ToolCallBlock, type ToolCallStatus } from './ToolCallBlock';

type Timing = {
  atFrame?: number;
  afterPrevious?: number;
};

export type CliEvent =
  | ({ type: 'prompt'; text: string } & Timing)
  | ({
      type: 'output';
      text: string;
      charsPerSecond?: number;
    } & Timing)
  | ({
      type: 'code';
      code: string;
      language?: string;
    } & Timing)
  | ({
      type: 'toolCall';
      label: string;
      detail?: string;
      status?: ToolCallStatus;
      body?: string;
    } & Timing)
  | ({ type: 'diff'; lines: DiffLine[] } & Timing);

export type { DiffLine };

export interface TerminalMockProps {
  events: CliEvent[];
  promptPrefix?: string;
  autoScroll?: boolean;
  style?: CSSProperties;
}

const DEFAULT_OUTPUT_CPS = 40;
const DEFAULT_CODE_CPS = 60;
const BLOCK_SETTLE_SECONDS = 0.3;

function estimateDurationFrames(event: CliEvent, fps: number): number {
  switch (event.type) {
    case 'prompt':
      return Math.ceil((event.text.length * fps) / DEFAULT_OUTPUT_CPS);
    case 'output': {
      const cps = event.charsPerSecond ?? DEFAULT_OUTPUT_CPS;
      return Math.ceil((event.text.length * fps) / cps);
    }
    case 'code':
      return Math.ceil((event.code.length * fps) / DEFAULT_CODE_CPS);
    case 'toolCall':
    case 'diff':
      return Math.ceil(fps * BLOCK_SETTLE_SECONDS);
  }
}

function resolveStartFrames(events: CliEvent[], fps: number): number[] {
  const starts = new Array<number>(events.length);
  let prevEnd = 0;
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    let start: number;
    if (event.atFrame != null) {
      start = event.atFrame;
    } else if (event.afterPrevious != null) {
      start = prevEnd + event.afterPrevious;
    } else {
      start = prevEnd;
    }
    starts[i] = start;
    prevEnd = start + estimateDurationFrames(event, fps);
  }
  return starts;
}

function renderEvent(
  event: CliEvent,
  startFrame: number,
  promptPrefix: string,
): ReactNode {
  switch (event.type) {
    case 'prompt':
      return (
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span
            style={{
              color: tokens.colors.fgMuted,
              marginRight: tokens.spacing.xs,
              flexShrink: 0,
            }}
          >
            {promptPrefix}
          </span>
          <StreamingText text={event.text} startFrame={startFrame} />
        </div>
      );
    case 'output':
      return (
        <StreamingText
          text={event.text}
          startFrame={startFrame}
          charsPerSecond={event.charsPerSecond ?? DEFAULT_OUTPUT_CPS}
          cursor={false}
        />
      );
    case 'code':
      return (
        <CodeBlock
          code={event.code}
          language={event.language ?? 'plaintext'}
          startFrame={startFrame}
        />
      );
    case 'toolCall':
      return (
        <ToolCallBlock
          label={event.label}
          detail={event.detail}
          status={event.status}
        >
          {event.body}
        </ToolCallBlock>
      );
    case 'diff':
      return <DiffBlock lines={event.lines} />;
  }
}

export function TerminalMock({
  events,
  promptPrefix = '> ',
  autoScroll = true,
  style,
}: TerminalMockProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrames = useMemo(
    () => resolveStartFrames(events, fps),
    [events, fps],
  );

  const viewportStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: autoScroll ? 'flex-end' : 'flex-start',
    fontFamily: tokens.fonts.mono,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.fg,
    boxSizing: 'border-box',
    ...style,
  };

  const contentStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.sm,
    flexShrink: 0,
  };

  return (
    <div style={viewportStyle}>
      <div style={contentStyle}>
        {events.map((event, i) => {
          const start = startFrames[i];
          if (frame < start) return null;
          return <div key={i}>{renderEvent(event, start, promptPrefix)}</div>;
        })}
      </div>
    </div>
  );
}
