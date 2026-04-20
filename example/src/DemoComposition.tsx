import type { CSSProperties } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import {
  BrowserFrame,
  crossFade,
  fadeIn,
  slideIn,
  TerminalFrame,
  TerminalMock,
  tokens,
  type CliEvent,
  type DiffLine,
  type SlideInResult,
} from 'remotion-scene-kit';

const SAMPLE_CODE = `<header className="site-header dark-mode">
  <h1>{title}</h1>
  <ThemeToggle />
</header>`;

const DIFF_LINES: DiffLine[] = [
  { type: 'context', text: '<header className="site-header">' },
  { type: 'remove', text: '  <h1>{title}</h1>' },
  { type: 'add', text: '  <div className="flex">' },
  { type: 'add', text: '    <h1>{title}</h1>' },
  { type: 'add', text: '    <ThemeToggle />' },
  { type: 'add', text: '  </div>' },
  { type: 'context', text: '</header>' },
];

const CLI_EVENTS: CliEvent[] = [
  { type: 'prompt', text: 'add dark mode toggle', atFrame: 5 },
  { type: 'output', text: 'Scanning components...', afterPrevious: 6 },
  {
    type: 'toolCall',
    label: 'Read',
    detail: 'src/components/Header.tsx',
    status: 'done',
    afterPrevious: 5,
  },
  {
    type: 'toolCall',
    label: 'Edit',
    detail: 'src/components/Header.tsx',
    status: 'done',
    afterPrevious: 4,
  },
  { type: 'code', code: SAMPLE_CODE, language: 'tsx', afterPrevious: 3 },
  { type: 'diff', lines: DIFF_LINES, afterPrevious: 6 },
];

const FEATURES = [
  {
    icon: '📺',
    title: 'TerminalMock',
    desc: 'Timed event streams — prompts, tool calls, code, diffs — with auto-scroll.',
  },
  {
    icon: '🎨',
    title: 'BrowserFrame',
    desc: 'Chrome-style chrome: tabs, URL bar, lock icon, and a reload animation.',
  },
  {
    icon: '⚡',
    title: 'CodeBlock',
    desc: 'Shiki-powered syntax highlighting with deterministic char-by-char reveal.',
  },
];

export function DemoComposition() {
  const frame = useCurrentFrame();
  const { outOpacity, inOpacity } = crossFade(frame, 150, 30);

  const zoom = interpolate(frame, [750, 900], [1, 1.05], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const endCardOpacity = fadeIn(frame, 760, 40);

  const headline = slideIn(frame, 200, 22, 'bottom', 40);
  const subhead = fadeIn(frame, 230, 22);
  const cta = fadeIn(frame, 260, 22);
  const cards: SlideInResult[] = [
    slideIn(frame, 300, 25, 'bottom', 30),
    slideIn(frame, 330, 25, 'bottom', 30),
    slideIn(frame, 360, 25, 'bottom', 30),
  ];

  const showTerminal = frame < 180;
  const showBrowser = frame >= 150;
  const showEndCard = frame >= 760;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0A0A0C' }}>
      {showTerminal ? (
        <AbsoluteFill style={{ opacity: outOpacity, padding: 80 }}>
          <TerminalFrame title="~/projects/my-app" padding={24}>
            <TerminalMock events={CLI_EVENTS} />
          </TerminalFrame>
        </AbsoluteFill>
      ) : null}

      {showBrowser ? (
        <AbsoluteFill
          style={{
            opacity: inOpacity,
            padding: 80,
            transform: `scale(${zoom})`,
          }}
        >
          <BrowserFrame
            url="https://remotion-scene-kit.dev"
            title="remotion-scene-kit"
            reloadAtFrame={152}
          >
            <LandingPage
              headline={headline}
              subhead={subhead}
              cta={cta}
              cards={cards}
            />
          </BrowserFrame>
        </AbsoluteFill>
      ) : null}

      {showEndCard ? (
        <AbsoluteFill
          style={{
            opacity: endCardOpacity,
            backgroundColor: 'rgba(10, 10, 12, 0.88)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <EndCard />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
}

interface LandingPageProps {
  headline: SlideInResult;
  subhead: number;
  cta: number;
  cards: SlideInResult[];
}

function LandingPage({ headline, subhead, cta, cards }: LandingPageProps) {
  const pageStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    padding: '72px 112px',
    fontFamily: tokens.fonts.sans,
    color: '#0A0A0C',
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
    boxSizing: 'border-box',
  };

  return (
    <div style={pageStyle}>
      <div
        style={{
          opacity: headline.opacity,
          transform: `translate(${headline.translateX}px, ${headline.translateY}px)`,
        }}
      >
        <h1
          style={{
            fontSize: 68,
            fontWeight: 800,
            margin: 0,
            letterSpacing: -1.5,
            lineHeight: 1.05,
          }}
        >
          Ship videos that teach.
        </h1>
      </div>

      <div style={{ opacity: subhead, maxWidth: 720 }}>
        <p
          style={{
            fontSize: 24,
            color: '#555',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          A tiny Remotion library for rendering developer workflow demos —
          CLI tool calls, streaming code, and realistic browser chrome.
        </p>
      </div>

      <div style={{ opacity: cta, display: 'flex', gap: 12, alignItems: 'center' }}>
        <span
          style={{
            padding: '14px 26px',
            backgroundColor: '#0A0A0C',
            color: 'white',
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 10,
            display: 'inline-block',
          }}
        >
          Get started →
        </span>
        <span
          style={{
            padding: '14px 22px',
            color: '#0A0A0C',
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 10,
            border: '1px solid #D4D4D8',
          }}
        >
          View on GitHub
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          marginTop: 24,
        }}
      >
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            style={{
              opacity: cards[i].opacity,
              transform: `translate(${cards[i].translateX}px, ${cards[i].translateY}px)`,
              padding: 22,
              border: '1px solid #E5E7EB',
              borderRadius: 14,
              backgroundColor: '#FAFAFA',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 6 }}>
              {f.title}
            </div>
            <div style={{ fontSize: 15, color: '#666', lineHeight: 1.5 }}>
              {f.desc}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 'auto',
          fontSize: 13,
          color: '#9CA3AF',
          paddingTop: 18,
          borderTop: '1px solid #EEE',
        }}
      >
        © 2026 remotion-scene-kit · MIT · Built with Remotion
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
          fontSize: 78,
          fontWeight: 800,
          letterSpacing: -2,
          marginBottom: 14,
        }}
      >
        remotion-scene-kit
      </div>
      <div style={{ fontSize: 22, color: '#A1A1AA' }}>
        Components for developer workflow videos
      </div>
    </div>
  );
}
