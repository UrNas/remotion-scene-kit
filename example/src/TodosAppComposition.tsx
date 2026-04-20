import type { CSSProperties } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import {
  BrowserFrame,
  crossFade,
  fadeIn,
  fadeOut,
  slideIn,
  TerminalFrame,
  tokens,
} from 'remotion-scene-kit';
import { ClaudeCliMock, type ClaudeCliEvent } from './ClaudeCliMock';
import { TodosApp, type Todo } from './TodosApp';

const TASK1_START = 130;
const TASK2_START = 550;
const TASK3_START = 930;

const POST_TYPING_SHIFT = 32;
const USER_HOLD_AFTER = 38;

const CLAMP = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const TASK1_EVENTS: ClaudeCliEvent[] = [
  {
    type: 'user',
    text: 'scaffold a React + Vite todos app',
    startFrame: TASK1_START,
    typingDuration: 34,
    holdAfter: USER_HOLD_AFTER,
  },
  {
    type: 'thinking',
    startFrame: TASK1_START + 44 + POST_TYPING_SHIFT,
    duration: 20,
    label: 'Planning the scaffold',
  },
  {
    type: 'assistant',
    text: "I'll scaffold a Vite + React + TypeScript project.",
    startFrame: TASK1_START + 66 + POST_TYPING_SHIFT,
  },
  {
    type: 'tool',
    name: 'Bash',
    args: 'npm create vite@latest todos-app -- --template react-ts',
    result: 'Scaffolding project in todos-app/',
    startFrame: TASK1_START + 96 + POST_TYPING_SHIFT,
    runningDuration: 18,
  },
  {
    type: 'tool',
    name: 'Bash',
    args: 'npm install',
    result: 'added 127 packages in 3.2s',
    startFrame: TASK1_START + 138 + POST_TYPING_SHIFT,
    runningDuration: 20,
  },
  {
    type: 'tool',
    name: 'Bash',
    args: 'npm run dev',
    result: 'VITE v5.4.0  ready in 412 ms · http://localhost:5173',
    startFrame: TASK1_START + 186 + POST_TYPING_SHIFT,
    runningDuration: 16,
  },
  {
    type: 'assistant',
    text: 'Dev server up on :5173. Ready for the UI.',
    startFrame: TASK1_START + 224 + POST_TYPING_SHIFT,
  },
];

const TASK2_EVENTS: ClaudeCliEvent[] = [
  {
    type: 'user',
    text: 'add an input and list with toggle + delete',
    startFrame: TASK2_START,
    typingDuration: 38,
    holdAfter: USER_HOLD_AFTER,
  },
  {
    type: 'thinking',
    startFrame: TASK2_START + 48 + POST_TYPING_SHIFT,
    duration: 18,
    label: 'Reading the current App',
  },
  {
    type: 'tool',
    name: 'Read',
    args: 'src/App.tsx',
    result: '24 lines',
    startFrame: TASK2_START + 70 + POST_TYPING_SHIFT,
    runningDuration: 12,
  },
  {
    type: 'assistant',
    text: "I'll wire useState, an input, and a list of rows with toggle + delete.",
    startFrame: TASK2_START + 100 + POST_TYPING_SHIFT,
  },
  {
    type: 'tool',
    name: 'Edit',
    args: 'src/App.tsx',
    result: '1 insertion, 1 replacement · 18 lines added',
    startFrame: TASK2_START + 142 + POST_TYPING_SHIFT,
    runningDuration: 22,
  },
  {
    type: 'assistant',
    text: 'Saved. Hot-reload picked it up — check the browser.',
    startFrame: TASK2_START + 180 + POST_TYPING_SHIFT,
  },
];

const TASK3_EVENTS: ClaudeCliEvent[] = [
  {
    type: 'user',
    text: 'persist todos to localStorage on change',
    startFrame: TASK3_START,
    typingDuration: 36,
    holdAfter: USER_HOLD_AFTER,
  },
  {
    type: 'tool',
    name: 'Read',
    args: 'src/App.tsx',
    result: '42 lines',
    startFrame: TASK3_START + 56 + POST_TYPING_SHIFT,
    runningDuration: 12,
  },
  {
    type: 'assistant',
    text: "I'll lazy-init from localStorage and write on every change.",
    startFrame: TASK3_START + 82 + POST_TYPING_SHIFT,
  },
  {
    type: 'tool',
    name: 'Edit',
    args: "src/App.tsx · add useEffect + JSON.parse seed",
    result: '2 insertions · 1 replacement',
    startFrame: TASK3_START + 124 + POST_TYPING_SHIFT,
    runningDuration: 20,
  },
  {
    type: 'assistant',
    text: 'Done. Reload the tab — your todos will still be there.',
    startFrame: TASK3_START + 162 + POST_TYPING_SHIFT,
  },
];

const TODOS_AFTER_UI: Todo[] = [
  { id: 'a', text: 'Ship the todos app', done: false },
  { id: 'b', text: 'Write tests', done: false },
];

interface PromptZoom {
  userStart: number;
  typingDuration: number;
}

function promptZoomScale(frame: number, win: PromptZoom): number {
  const PEAK = 1.45;
  const typingEnd = win.userStart + win.typingDuration;
  const zoomInStart = win.userStart - 5;
  const zoomInEnd = win.userStart + 10;
  const holdEnd = typingEnd + 20;
  const zoomOutEnd = holdEnd + 15;

  if (frame < zoomInStart || frame >= zoomOutEnd) return 1;
  if (frame < zoomInEnd) {
    return interpolate(frame, [zoomInStart, zoomInEnd], [1, PEAK], CLAMP);
  }
  if (frame < holdEnd) return PEAK;
  return interpolate(frame, [holdEnd, zoomOutEnd], [PEAK, 1], CLAMP);
}

function conversationDrift(
  frame: number,
  zoomOutEnd: number,
  sceneEnd: number,
): number {
  if (frame < zoomOutEnd) return 1;
  return interpolate(frame, [zoomOutEnd, sceneEnd], [1, 1.035], CLAMP);
}

export function TodosAppComposition() {
  const frame = useCurrentFrame();

  const introOpacity =
    frame < 60 ? fadeIn(frame, 10, 30) : fadeOut(frame, 80, 30);

  const task1Cross = crossFade(frame, 420, 30);
  const browser1Cross = crossFade(frame, 540, 30);
  const task2Cross = crossFade(frame, 800, 30);
  const browser2Cross = crossFade(frame, 920, 30);
  const task3Cross = crossFade(frame, 1160, 30);
  const browser3Cross = crossFade(frame, 1280, 30);

  const endCardOpacity = fadeIn(frame, 1282, 40);
  const endZoom = interpolate(frame, [1280, 1350], [1, 1.05], CLAMP);

  const showIntro = frame < 125;
  const showTask1 = frame >= 115 && frame < 455;
  const showBrowser1 = frame >= 415 && frame < 575;
  const showTask2 = frame >= 535 && frame < 835;
  const showBrowser2 = frame >= 795 && frame < 955;
  const showTask3 = frame >= 915 && frame < 1195;
  const showBrowser3 = frame >= 1155 && frame < 1315;
  const showEndCard = frame >= 1275;

  const task1Opacity = frame < 420 ? 1 : task1Cross.outOpacity;
  const browser1InOpacity =
    frame < 420 ? 0 : frame < 540 ? task1Cross.inOpacity : browser1Cross.outOpacity;
  const task2Opacity =
    frame < 540 ? 0 : frame < 800 ? browser1Cross.inOpacity : task2Cross.outOpacity;
  const browser2InOpacity =
    frame < 800 ? 0 : frame < 920 ? task2Cross.inOpacity : browser2Cross.outOpacity;
  const task3Opacity =
    frame < 920 ? 0 : frame < 1160 ? browser2Cross.inOpacity : task3Cross.outOpacity;
  const browser3InOpacity =
    frame < 1160 ? 0 : frame < 1280 ? task3Cross.inOpacity : browser3Cross.outOpacity;

  const task1Zoom: PromptZoom = { userStart: TASK1_START, typingDuration: 34 };
  const task2Zoom: PromptZoom = { userStart: TASK2_START, typingDuration: 38 };
  const task3Zoom: PromptZoom = { userStart: TASK3_START, typingDuration: 36 };

  const task1ScaleZoom = promptZoomScale(frame, task1Zoom);
  const task1ScaleDrift = conversationDrift(
    frame,
    TASK1_START + 34 + 20 + 15,
    450,
  );
  const task1Scale =
    task1ScaleZoom > 1 ? task1ScaleZoom : task1ScaleDrift;

  const task2ScaleZoom = promptZoomScale(frame, task2Zoom);
  const task2ScaleDrift = conversationDrift(
    frame,
    TASK2_START + 38 + 20 + 15,
    830,
  );
  const task2Scale =
    task2ScaleZoom > 1 ? task2ScaleZoom : task2ScaleDrift;

  const task3ScaleZoom = promptZoomScale(frame, task3Zoom);
  const task3ScaleDrift = conversationDrift(
    frame,
    TASK3_START + 36 + 20 + 15,
    1190,
  );
  const task3Scale =
    task3ScaleZoom > 1 ? task3ScaleZoom : task3ScaleDrift;

  const row1Anim = slideIn(frame, 840, 22, 'bottom', 24);
  const row2Anim = slideIn(frame, 864, 22, 'bottom', 24);
  const row1Check = interpolate(frame, [890, 915], [0, 1], CLAMP);

  const scene2Todos: Todo[] = [
    { ...TODOS_AFTER_UI[0], done: row1Check > 0.5, doneProgress: row1Check },
    { ...TODOS_AFTER_UI[1] },
  ];

  const scene3RowAnim1 = slideIn(frame, 1210, 22, 'bottom', 20);
  const scene3RowAnim2 = slideIn(frame, 1230, 22, 'bottom', 20);
  const scene3Todos: Todo[] = [
    { ...TODOS_AFTER_UI[0], done: true, doneProgress: 1 },
    { ...TODOS_AFTER_UI[1] },
  ];
  const footerNoteOpacity = fadeIn(frame, 1240, 24);

  const cliSceneWrapperStyle = (scale: number): CSSProperties => ({
    width: '100%',
    height: '100%',
    transform: `scale(${scale})`,
    transformOrigin: '8% 92%',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0A0A0C' }}>
      {showIntro ? (
        <AbsoluteFill
          style={{
            opacity: introOpacity,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 80,
          }}
        >
          <IntroTitle />
        </AbsoluteFill>
      ) : null}

      {showTask1 ? (
        <AbsoluteFill style={{ opacity: task1Opacity, padding: 80 }}>
          <div style={cliSceneWrapperStyle(task1Scale)}>
            <ClaudeCliScene
              title="claude ~/projects/todos-app"
              events={TASK1_EVENTS}
              sessionTokens="3.8k"
              contextRemaining="156.2k"
            />
          </div>
        </AbsoluteFill>
      ) : null}

      {showBrowser1 ? (
        <AbsoluteFill style={{ opacity: browser1InOpacity, padding: 80 }}>
          <BrowserFrame
            url="http://localhost:5173"
            title="Todos"
            reloadAtFrame={422}
          >
            <TodosApp todos={[]} inputValue="" caretVisible={false} />
          </BrowserFrame>
        </AbsoluteFill>
      ) : null}

      {showTask2 ? (
        <AbsoluteFill style={{ opacity: task2Opacity, padding: 80 }}>
          <div style={cliSceneWrapperStyle(task2Scale)}>
            <ClaudeCliScene
              title="claude ~/projects/todos-app"
              events={TASK2_EVENTS}
              sessionTokens="9.2k"
              contextRemaining="150.8k"
            />
          </div>
        </AbsoluteFill>
      ) : null}

      {showBrowser2 ? (
        <AbsoluteFill style={{ opacity: browser2InOpacity, padding: 80 }}>
          <BrowserFrame
            url="http://localhost:5173"
            title="Todos"
            reloadAtFrame={802}
          >
            <TodosApp
              todos={scene2Todos}
              inputValue=""
              rowAnimations={[row1Anim, row2Anim]}
              caretVisible={false}
            />
          </BrowserFrame>
        </AbsoluteFill>
      ) : null}

      {showTask3 ? (
        <AbsoluteFill style={{ opacity: task3Opacity, padding: 80 }}>
          <div style={cliSceneWrapperStyle(task3Scale)}>
            <ClaudeCliScene
              title="claude ~/projects/todos-app"
              events={TASK3_EVENTS}
              sessionTokens="14.1k"
              contextRemaining="145.9k"
            />
          </div>
        </AbsoluteFill>
      ) : null}

      {showBrowser3 ? (
        <AbsoluteFill style={{ opacity: browser3InOpacity, padding: 80 }}>
          <BrowserFrame
            url="http://localhost:5173"
            title="Todos"
            reloadAtFrame={1162}
          >
            <TodosApp
              todos={scene3Todos}
              inputValue=""
              rowAnimations={[scene3RowAnim1, scene3RowAnim2]}
              caretVisible={false}
              footerNote="Reload → todos persist via localStorage"
              footerNoteOpacity={footerNoteOpacity}
            />
          </BrowserFrame>
        </AbsoluteFill>
      ) : null}

      {showEndCard ? (
        <AbsoluteFill
          style={{
            opacity: endCardOpacity,
            backgroundColor: 'rgba(10,10,12,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${endZoom})`,
            pointerEvents: 'none',
          }}
        >
          <EndCard />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
}

interface ClaudeCliSceneProps {
  title: string;
  events: ClaudeCliEvent[];
  sessionTokens?: string;
  contextRemaining?: string;
}

function ClaudeCliScene({
  title,
  events,
  sessionTokens,
  contextRemaining,
}: ClaudeCliSceneProps) {
  return (
    <TerminalFrame title={title} padding={0}>
      <ClaudeCliMock
        events={events}
        sessionTokens={sessionTokens}
        contextRemaining={contextRemaining}
      />
    </TerminalFrame>
  );
}

function IntroTitle() {
  const subStyle: CSSProperties = {
    fontSize: 24,
    color: '#A1A1AA',
    marginTop: 18,
    fontWeight: 500,
  };

  return (
    <div style={{ fontFamily: tokens.fonts.sans, color: 'white' }}>
      <div
        style={{
          fontSize: 68,
          fontWeight: 800,
          letterSpacing: -1.5,
          lineHeight: 1.1,
        }}
      >
        Building a todos app
        <br />
        with Claude CLI
      </div>
      <div style={subStyle}>
        Three prompts. One terminal. One browser tab.
      </div>
    </div>
  );
}

function EndCard() {
  return (
    <div
      style={{
        fontFamily: tokens.fonts.sans,
        color: 'white',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          letterSpacing: -2,
          marginBottom: 14,
        }}
      >
        remotion-scene-kit
      </div>
      <div style={{ fontSize: 22, color: '#A1A1AA' }}>
        45 seconds. Three prompts. Zero brand assumptions.
      </div>
    </div>
  );
}
