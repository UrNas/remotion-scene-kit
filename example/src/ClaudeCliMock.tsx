import type { CSSProperties, ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import { fadeIn, StreamingText, tokens } from 'remotion-scene-kit';

const CLAUDE_ORANGE = '#D97757';
const CLAUDE_DIM = '#898784';
const CLAUDE_TEXT = '#E4E3DD';
const CLAUDE_MUTED = '#636161';
const CLAUDE_BG = '#1A1918';
const CLAUDE_INPUT_BORDER = '#3A3734';
const CLAUDE_TREE = '#5A5855';

type UserEvent = {
  type: 'user';
  text: string;
  startFrame: number;
  typingDuration?: number;
  holdAfter?: number;
};

type AssistantEvent = {
  type: 'assistant';
  text: string;
  startFrame: number;
  charsPerSecond?: number;
};

type ToolEvent = {
  type: 'tool';
  name: string;
  args: string;
  result?: string;
  startFrame: number;
  runningDuration?: number;
};

type ThinkingEvent = {
  type: 'thinking';
  startFrame: number;
  duration: number;
  label?: string;
};

export type ClaudeCliEvent =
  | UserEvent
  | AssistantEvent
  | ToolEvent
  | ThinkingEvent;

export interface ClaudeCliMockProps {
  events: ClaudeCliEvent[];
  cwd?: string;
  model?: string;
  mode?: string;
  inputPlaceholder?: string;
  plan?: string;
  contextRemaining?: string;
  sessionTokens?: string;
}

const DEFAULT_TYPING_DURATION = 30;
const DEFAULT_HOLD_AFTER = 6;
const DEFAULT_TOOL_RUNNING = 14;

function userTypingEnd(ev: UserEvent) {
  return ev.startFrame + (ev.typingDuration ?? DEFAULT_TYPING_DURATION);
}

function userSendFrame(ev: UserEvent) {
  return userTypingEnd(ev) + (ev.holdAfter ?? DEFAULT_HOLD_AFTER);
}

export function ClaudeCliMock({
  events,
  cwd = '~/projects/todos-app',
  model = 'opus-4.7-1m',
  mode = 'bypass-permissions',
  inputPlaceholder = 'Try "help me build something"',
  plan = 'Max 20x',
  contextRemaining = '142.4k',
  sessionTokens = '3.8k',
}: ClaudeCliMockProps) {
  const frame = useCurrentFrame();

  const activeUserTyping = events.find(
    (e): e is UserEvent =>
      e.type === 'user' && frame >= e.startFrame && frame < userSendFrame(e),
  );

  const activeThinking = events.find(
    (e): e is ThinkingEvent =>
      e.type === 'thinking' &&
      frame >= e.startFrame &&
      frame < e.startFrame + e.duration,
  );

  const conversationItems = events
    .map((event, index) => {
      if (event.type === 'user') {
        const sendAt = userSendFrame(event);
        if (frame < sendAt) return null;
        return (
          <UserLine
            key={`user-${index}`}
            text={event.text}
            revealFrame={sendAt}
          />
        );
      }
      if (event.type === 'assistant') {
        if (frame < event.startFrame) return null;
        return (
          <AssistantLine
            key={`assistant-${index}`}
            text={event.text}
            startFrame={event.startFrame}
            charsPerSecond={event.charsPerSecond}
          />
        );
      }
      if (event.type === 'tool') {
        if (frame < event.startFrame) return null;
        const runningDuration = event.runningDuration ?? DEFAULT_TOOL_RUNNING;
        const doneFrame = event.startFrame + runningDuration;
        return (
          <ToolBlock
            key={`tool-${index}`}
            name={event.name}
            args={event.args}
            result={event.result}
            startFrame={event.startFrame}
            doneFrame={doneFrame}
          />
        );
      }
      return null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundColor: CLAUDE_BG,
        fontFamily: tokens.fonts.mono,
        color: CLAUDE_TEXT,
        fontSize: 18,
        lineHeight: 1.55,
        padding: '20px 24px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          paddingBottom: 18,
          overflow: 'hidden',
        }}
      >
        {conversationItems}
        {activeThinking ? (
          <ThinkingLine
            label={activeThinking.label ?? 'Thinking'}
            startFrame={activeThinking.startFrame}
          />
        ) : null}
      </div>

      <InputBox
        activeText={activeUserTyping?.text ?? ''}
        typingStart={activeUserTyping?.startFrame}
        typingEnd={activeUserTyping ? userTypingEnd(activeUserTyping) : undefined}
        placeholder={inputPlaceholder}
        cwd={cwd}
        model={model}
        mode={mode}
        plan={plan}
        contextRemaining={contextRemaining}
        sessionTokens={sessionTokens}
      />
    </div>
  );
}

interface UserLineProps {
  text: string;
  revealFrame: number;
}

function UserLine({ text, revealFrame }: UserLineProps) {
  const frame = useCurrentFrame();
  const opacity = fadeIn(frame, revealFrame, 6);

  return (
    <div
      style={{
        opacity,
        display: 'flex',
        gap: 10,
        color: CLAUDE_TEXT,
      }}
    >
      <span style={{ color: CLAUDE_DIM }}>&gt;</span>
      <span>{text}</span>
    </div>
  );
}

interface AssistantLineProps {
  text: string;
  startFrame: number;
  charsPerSecond?: number;
}

function AssistantLine({
  text,
  startFrame,
  charsPerSecond = 55,
}: AssistantLineProps) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <span style={{ color: CLAUDE_ORANGE, fontSize: 14, lineHeight: '28px' }}>
        ●
      </span>
      <StreamingText
        text={text}
        startFrame={startFrame}
        charsPerSecond={charsPerSecond}
        cursor={false}
        style={{
          color: CLAUDE_TEXT,
          fontFamily: tokens.fonts.mono,
          fontSize: 18,
          lineHeight: 1.55,
        }}
      />
    </div>
  );
}

interface ToolBlockProps {
  name: string;
  args: string;
  result?: string;
  startFrame: number;
  doneFrame: number;
}

function ToolBlock({
  name,
  args,
  result,
  startFrame,
  doneFrame,
}: ToolBlockProps) {
  const frame = useCurrentFrame();
  const lineOpacity = fadeIn(frame, startFrame, 8);
  const isDone = frame >= doneFrame;
  const resultOpacity = fadeIn(frame, doneFrame, 8);
  const runningTick = Math.floor((frame - startFrame) / 6) % 3;

  return (
    <div
      style={{
        opacity: lineOpacity,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
        <span
          style={{
            color: isDone ? CLAUDE_ORANGE : CLAUDE_DIM,
            fontSize: 14,
            lineHeight: '28px',
          }}
        >
          ⏺
        </span>
        <div style={{ flex: 1, wordBreak: 'break-all' }}>
          <span style={{ color: CLAUDE_TEXT, fontWeight: 600 }}>{name}</span>
          <span style={{ color: CLAUDE_DIM }}>(</span>
          <span style={{ color: CLAUDE_TEXT }}>{args}</span>
          <span style={{ color: CLAUDE_DIM }}>)</span>
        </div>
      </div>

      {result ? (
        <div
          style={{
            opacity: resultOpacity,
            display: 'flex',
            gap: 10,
            paddingLeft: 6,
            color: CLAUDE_DIM,
          }}
        >
          <span style={{ color: CLAUDE_TREE, fontSize: 16 }}>⎿</span>
          <span>{result}</span>
        </div>
      ) : !isDone ? (
        <div
          style={{
            display: 'flex',
            gap: 10,
            paddingLeft: 6,
            color: CLAUDE_DIM,
          }}
        >
          <span style={{ color: CLAUDE_TREE, fontSize: 16 }}>⎿</span>
          <span>Running{'.'.repeat(runningTick + 1)}</span>
        </div>
      ) : null}
    </div>
  );
}

interface ThinkingLineProps {
  label: string;
  startFrame: number;
}

function ThinkingLine({ label, startFrame }: ThinkingLineProps) {
  const frame = useCurrentFrame();
  const tick = Math.floor((frame - startFrame) / 5) % 4;
  const dots = '.'.repeat(tick);

  return (
    <div style={{ display: 'flex', gap: 10, color: CLAUDE_ORANGE }}>
      <span style={{ fontSize: 14, lineHeight: '28px' }}>✻</span>
      <span style={{ color: CLAUDE_DIM }}>
        {label}
        {dots}
      </span>
    </div>
  );
}

interface InputBoxProps {
  activeText: string;
  typingStart?: number;
  typingEnd?: number;
  placeholder: string;
  cwd: string;
  model: string;
  mode: string;
  plan: string;
  contextRemaining: string;
  sessionTokens: string;
}

function InputBox({
  activeText,
  typingStart,
  typingEnd,
  placeholder,
  cwd,
  model,
  mode,
  plan,
  contextRemaining,
  sessionTokens,
}: InputBoxProps) {
  const frame = useCurrentFrame();

  let shownText = '';
  if (typingStart !== undefined && typingEnd !== undefined) {
    const total = typingEnd - typingStart;
    const elapsed = Math.max(0, Math.min(total, frame - typingStart));
    const chars = Math.floor(activeText.length * (elapsed / Math.max(1, total)));
    shownText = activeText.slice(0, chars);
  }

  const caretVisible = Math.floor(frame / 15) % 2 === 0;

  const boxStyle: CSSProperties = {
    border: `1px solid ${CLAUDE_INPUT_BORDER}`,
    borderRadius: 12,
    padding: '14px 18px',
    backgroundColor: '#1F1D1C',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minHeight: 28,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={boxStyle}>
        <span style={{ color: CLAUDE_ORANGE }}>&gt;</span>
        {shownText.length > 0 ? (
          <span style={{ color: CLAUDE_TEXT }}>{shownText}</span>
        ) : (
          <span style={{ color: CLAUDE_MUTED }}>{placeholder}</span>
        )}
        <span
          style={{
            display: 'inline-block',
            width: 9,
            height: 20,
            backgroundColor: caretVisible ? CLAUDE_TEXT : 'transparent',
            marginLeft: 2,
          }}
        />
      </div>

      <StatusLine
        cwd={cwd}
        model={model}
        mode={mode}
        plan={plan}
        contextRemaining={contextRemaining}
        sessionTokens={sessionTokens}
      />
    </div>
  );
}

interface StatusLineProps {
  cwd: string;
  model: string;
  mode: string;
  plan: string;
  contextRemaining: string;
  sessionTokens: string;
}

function StatusLine({
  cwd,
  model,
  mode,
  plan,
  contextRemaining,
  sessionTokens,
}: StatusLineProps): ReactNode {
  const dot = (
    <span style={{ color: CLAUDE_MUTED, padding: '0 6px' }}>·</span>
  );

  return (
    <div
      style={{
        display: 'flex',
        fontSize: 13,
        color: CLAUDE_MUTED,
        padding: '0 6px',
        justifyContent: 'space-between',
        gap: 24,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <span>? for shortcuts</span>
        {dot}
        <span>{mode}</span>
        {dot}
        <span>{cwd}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <span>{model}</span>
        {dot}
        <span style={{ color: CLAUDE_ORANGE }}>{plan}</span>
        {dot}
        <span>{sessionTokens} session</span>
        {dot}
        <span>{contextRemaining} left</span>
      </div>
    </div>
  );
}

