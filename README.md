# remotion-scene-kit

A small Remotion component library for making developer-workflow demo videos — terminal chrome, streaming CLI output, syntax-highlighted code, diffs, and browser frames. Deliberately generic: no product or brand references, only primitives you apply your own content and theme to.

## Install

```bash
npm install remotion-scene-kit
# optional — enables syntax highlighting in <CodeBlock>:
npm install shiki
```

Peer dependencies: `remotion ^4.0.0`, `react >=18`, `react-dom >=18`. `shiki >=1.0.0` is an **optional** peer — if it's missing at runtime, `CodeBlock` falls back to plain monospaced text.

## Quick start

```tsx
import { AbsoluteFill, Composition } from 'remotion';
import {
  TerminalFrame,
  TerminalMock,
  type CliEvent,
} from 'remotion-scene-kit';

const events: CliEvent[] = [
  { type: 'prompt', text: 'deploy production', atFrame: 0 },
  { type: 'output', text: 'Building...', afterPrevious: 10 },
  {
    type: 'toolCall',
    label: 'Upload',
    detail: 'dist/',
    status: 'done',
    afterPrevious: 8,
  },
];

function Demo() {
  return (
    <AbsoluteFill style={{ padding: 40, backgroundColor: '#0A0A0C' }}>
      <TerminalFrame title="~/projects/site" padding={24}>
        <TerminalMock events={events} />
      </TerminalFrame>
    </AbsoluteFill>
  );
}

export const Root = () => (
  <Composition
    id="Demo"
    component={Demo}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);
```

Paste into a Remotion v4 project, register `Root` with `registerRoot(Root)`, run `remotion studio`.

## Components

### `<TerminalFrame>`

macOS-style window chrome: traffic-light dots, centered title, dark body.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `string` | `'Terminal'` | Centered in the title bar |
| `width` / `height` | `number \| string` | `'100%'` | |
| `padding` | `number` | `tokens.spacing.md` | Inner body padding |
| `theme` | `Partial<Tokens>` | — | Per-category token override (see [Design tokens](#design-tokens)) |
| `children` | `ReactNode` | — | Body content |

### `<BrowserFrame>`

Chrome-style browser window with tabs, URL bar, lock icon, desktop/mobile viewports, and an optional reload animation.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `url` | `string` | `'https://example.com'` | Shown in the URL pill |
| `title` | `string` | `'New Tab'` | Active tab title |
| `showTabs` | `boolean` | `true` | |
| `viewport` | `'desktop' \| 'mobile'` | `'desktop'` | `mobile` clamps inner width to 420px |
| `reloadAtFrame` | `number` | — | If set, plays a progress-bar sweep + page flash starting at this frame |
| `theme` | `Partial<Tokens>` | — | |
| `children` | `ReactNode` | — | Rendered on a white page body |

### `<TerminalMock>`

A higher-level composition that drives a CLI timeline from a single `events` array. Works inside `<TerminalFrame>`.

| Prop | Type | Default |
| --- | --- | --- |
| `events` | `CliEvent[]` | — |
| `promptPrefix` | `string` | `'> '` |
| `autoScroll` | `boolean` | `true` (content pins to the bottom of the viewport) |
| `style` | `CSSProperties` | — |

`CliEvent` is a discriminated union; each variant accepts **either** `atFrame` (absolute) **or** `afterPrevious` (frames offset from the previous event's estimated end):

```ts
type CliEvent =
  | { type: 'prompt';  text: string; /* timing */ }
  | { type: 'output';  text: string; charsPerSecond?: number; /* timing */ }
  | { type: 'code';    code: string; language?: string; /* timing */ }
  | { type: 'toolCall'; label: string; detail?: string; status?: 'running' | 'done' | 'error'; body?: string; /* timing */ }
  | { type: 'diff';    lines: DiffLine[]; /* timing */ };
```

### `<StreamingText>`

Character-by-character reveal tied to Remotion's frame clock.

| Prop | Type | Default |
| --- | --- | --- |
| `text` | `string` | — |
| `startFrame` | `number` | `0` |
| `charsPerSecond` | `number` | `40` |
| `jitter` | `number` (0–1) | `0.2` |
| `seed` | `number` | `1` |
| `cursor` | `boolean` | `true` |
| `style` | `CSSProperties` | — |

Same `seed` always produces the same reveal timing — see [Fonts & determinism](#fonts--determinism).

### `<CodeBlock>`

Syntax-highlighted streaming code. Dynamically imports `shiki` — with it, tokens are themed; without it, renders as plain monospaced text.

| Prop | Type | Default |
| --- | --- | --- |
| `code` | `string` | — |
| `language` | `string` | `'plaintext'` |
| `theme` | `string` | `'github-dark'` |
| `reveal` | `'type' \| 'show' \| 'highlight'` | `'type'` |
| `startFrame` | `number` | `0` |
| `charsPerSecond` | `number` | `60` |
| `jitter` | `number` | `0.1` |
| `seed` | `number` | `1` |
| `width` | `number \| string` | — |
| `minFontSize` / `maxFontSize` | `number` | `12` / `24` |
| `style` | `CSSProperties` | — |

If `width` is a number, font size auto-downscales so the longest line fits. `reveal='highlight'` renders all lines with a sweep band; `reveal='show'` renders fully.

```tsx
<CodeBlock
  code={`function hello() { return 'hi'; }`}
  language="typescript"
  reveal="type"
/>
```

### `<ToolCallBlock>`

Bordered block representing a tool/command invocation — deliberately neutral, no AI branding.

| Prop | Type | Default |
| --- | --- | --- |
| `label` | `string` | — (e.g., `'Read'`, `'Edit'`, `'Bash'`) |
| `detail` | `string` | — (e.g., a file path) |
| `status` | `'running' \| 'done' \| 'error'` | `'done'` |
| `children` | `ReactNode` | — (optional body under a separator) |
| `style` | `CSSProperties` | — |

### `<DiffBlock>`

Simple red/green line diff.

| Prop | Type | Default |
| --- | --- | --- |
| `lines` | `Array<{ type: 'add' \| 'remove' \| 'context'; text: string }>` | — |
| `showLineNumbers` | `boolean` | `true` |
| `style` | `CSSProperties` | — |

## Design tokens

All defaults come from a single `tokens` constant with `colors`, `spacing`, `radii`, `fonts`, and `fontSize` categories.

```ts
import { tokens, mergeTheme } from 'remotion-scene-kit';

tokens.colors.bgTerminalDark;  // '#1E1E1E'
tokens.fontSize.md;            // 16
```

Components that accept a `theme` prop (`TerminalFrame`, `BrowserFrame`) apply it via the `mergeTheme` helper, which shallow-merges per category. Because `tokens` uses `as const` for literal types, pass a full category spread when overriding:

```tsx
<TerminalFrame
  theme={{
    colors: { ...tokens.colors, border: 'rgba(255,255,255,0.2)' },
  }}
>
  ...
</TerminalFrame>
```

## Animation helpers

Pure, frame-driven helpers built on Remotion's `interpolate` + `Easing`.

```ts
import { fadeIn, fadeOut, slideIn, crossFade } from 'remotion-scene-kit';

fadeIn(frame, startFrame, durationFrames);                 // → opacity 0→1
fadeOut(frame, startFrame, durationFrames);                // → opacity 1→0
slideIn(frame, startFrame, durationFrames, 'bottom', 40);  // → { translateX, translateY, opacity }
crossFade(frame, startFrame, durationFrames);              // → { outOpacity, inOpacity }
```

All are clamped at both ends and deterministic. Named exports are the only form — there is no `animation` namespace.

## Fonts & determinism

Remotion renders must be deterministic across local dev, CI, and Lambda. The system-font fallbacks in `tokens.fonts` (`SF Mono`, `Menlo`, `-apple-system`) **are not guaranteed** on Linux / Lambda and will silently fall back to whatever the container has. Load fonts explicitly:

```ts
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';
import { loadFont as loadSans } from '@remotion/google-fonts/Inter';

loadMono();
loadSans();
```

Then override `tokens.fonts` via a theme prop if you want the library to reference those families by name.

All randomness in this library (the `jitter` in `StreamingText` and `CodeBlock`) is driven by a seeded PRNG and the Remotion frame clock — no `Math.random()`, no `Date.now()`. Same seed + same frame → same output, on every machine.

## Optional: syntax highlighting

`<CodeBlock>` calls `await import('shiki')` at runtime behind a try/catch:

- If `shiki` is installed → tokens are themed (defaults to `github-dark`, configurable via the `theme` prop) and cached per `lang::theme::code` key.
- If `shiki` is missing or the language isn't bundled → the component falls back to plain monospaced text. No runtime error.

## Roadmap

**v1 scope**: the primitives above, design tokens, animation helpers, seeded determinism.

**Deliberately excluded from v1**:

- Audio slots or built-in sound effects.
- Theme presets (light/dark/etc.) — use `theme` props and `mergeTheme` directly.
- `IOSSimulatorFrame` — an empty iPhone chrome wrapper without content primitives (StatusBar, NavBar, ListRow) produces fake-looking mocks. Revisit in v2 alongside proper iOS primitives.
- AI-specific components — the CLI primitives are intentionally generic; pass your own labels.

## License

MIT
