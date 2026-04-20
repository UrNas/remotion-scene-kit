import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  continueRender,
  delayRender,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { useCharReveal } from '../internal/useCharReveal';
import { tokens } from '../tokens';

export type CodeBlockReveal = 'type' | 'show' | 'highlight';

export interface CodeBlockProps {
  code: string;
  language?: string;
  theme?: string;
  reveal?: CodeBlockReveal;
  startFrame?: number;
  charsPerSecond?: number;
  jitter?: number;
  seed?: number;
  width?: number | string;
  minFontSize?: number;
  maxFontSize?: number;
  style?: CSSProperties;
}

type ShikiToken = {
  content: string;
  color?: string;
  fontStyle?: number;
};

type HighlightResult = {
  tokens: ShikiToken[][];
  fg?: string;
  bg?: string;
};

const highlightCache = new Map<string, Promise<HighlightResult | null>>();

async function loadHighlight(
  code: string,
  lang: string,
  theme: string,
): Promise<HighlightResult | null> {
  const key = `${lang}::${theme}::${code}`;
  const cached = highlightCache.get(key);
  if (cached) return cached;
  const promise = (async (): Promise<HighlightResult | null> => {
    try {
      const shiki = (await import('shiki')) as unknown as {
        createHighlighter: (opts: {
          themes: string[];
          langs: string[];
        }) => Promise<{
          codeToTokens: (
            code: string,
            opts: { lang: string; theme: string },
          ) => { tokens: ShikiToken[][]; fg?: string; bg?: string };
        }>;
      };
      const highlighter = await shiki.createHighlighter({
        themes: [theme],
        langs: [lang],
      });
      const result = highlighter.codeToTokens(code, { lang, theme });
      return { tokens: result.tokens, fg: result.fg, bg: result.bg };
    } catch {
      return null;
    }
  })();
  highlightCache.set(key, promise);
  return promise;
}

function styleForToken(tok: ShikiToken): CSSProperties {
  const out: CSSProperties = {};
  if (tok.color) out.color = tok.color;
  if (tok.fontStyle && tok.fontStyle > 0) {
    if (tok.fontStyle & 1) out.fontStyle = 'italic';
    if (tok.fontStyle & 2) out.fontWeight = 'bold';
    if (tok.fontStyle & 4) out.textDecoration = 'underline';
  }
  return out;
}

export function CodeBlock({
  code,
  language = 'plaintext',
  theme = 'github-dark',
  reveal = 'type',
  startFrame = 0,
  charsPerSecond = 60,
  jitter = 0.1,
  seed = 1,
  width,
  minFontSize = 12,
  maxFontSize = 24,
  style,
}: CodeBlockProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shouldHighlight = language !== 'plaintext';

  const [result, setResult] = useState<HighlightResult | null>(null);

  useEffect(() => {
    if (!shouldHighlight) return;
    const handle = delayRender(`code-block-${language}-${theme}`);
    let cancelled = false;
    loadHighlight(code, language, theme)
      .then((r) => {
        if (!cancelled) setResult(r);
      })
      .catch(() => {
        /* swallowed — fall back to plain text */
      })
      .finally(() => continueRender(handle));
    return () => {
      cancelled = true;
    };
  }, [code, language, theme, shouldHighlight]);

  const revealCount = useCharReveal({
    text: code,
    startFrame,
    charsPerSecond,
    jitter,
    seed,
  });

  const fontSize = useMemo(() => {
    if (typeof width !== 'number') return maxFontSize;
    const lines = code.split('\n');
    const longest = lines.reduce((m, l) => Math.max(m, l.length), 0);
    if (longest === 0) return maxFontSize;
    const APPROX_CHAR_WIDTH_FACTOR = 0.6;
    for (let size = maxFontSize; size >= minFontSize; size--) {
      if (longest * size * APPROX_CHAR_WIDTH_FACTOR <= width) return size;
    }
    return minFontSize;
  }, [code, width, minFontSize, maxFontSize]);

  const containerStyle: CSSProperties = {
    fontFamily: tokens.fonts.mono,
    fontSize,
    lineHeight: 1.45,
    color: result?.fg ?? tokens.colors.fg,
    backgroundColor: result?.bg ?? 'transparent',
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    whiteSpace: 'pre',
    overflow: 'hidden',
    boxSizing: 'border-box',
    width,
    ...style,
  };

  if (!result) {
    const text = reveal === 'type' ? code.slice(0, revealCount) : code;
    return <div style={containerStyle}>{text}</div>;
  }

  if (reveal !== 'type') {
    const numLines = result.tokens.length;
    const sweepSeconds = 2;
    const secondsSince = Math.max(0, (frame - startFrame) / fps);
    const highlightedIdx =
      reveal === 'highlight' && numLines > 0
        ? Math.floor(((secondsSince / sweepSeconds) % 1) * numLines)
        : -1;
    return (
      <div style={containerStyle}>
        {result.tokens.map((line, i) => (
          <div
            key={i}
            style={{
              minHeight: '1em',
              backgroundColor:
                i === highlightedIdx
                  ? 'rgba(255, 255, 255, 0.08)'
                  : undefined,
            }}
          >
            {line.map((tok, j) => (
              <span key={j} style={styleForToken(tok)}>
                {tok.content}
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  }

  const lineElements: ReactNode[] = [];
  let pos = 0;
  let done = false;
  for (let i = 0; i < result.tokens.length; i++) {
    const line = result.tokens[i];
    const spans: ReactNode[] = [];
    for (let j = 0; j < line.length; j++) {
      if (pos >= revealCount) {
        done = true;
        break;
      }
      const tok = line[j];
      const tokenEnd = pos + tok.content.length;
      if (tokenEnd <= revealCount) {
        spans.push(
          <span key={j} style={styleForToken(tok)}>
            {tok.content}
          </span>,
        );
        pos = tokenEnd;
      } else {
        const take = revealCount - pos;
        spans.push(
          <span key={j} style={styleForToken(tok)}>
            {tok.content.slice(0, take)}
          </span>,
        );
        pos = revealCount;
        done = true;
      }
    }
    lineElements.push(
      <div key={i} style={{ minHeight: '1em' }}>
        {spans}
      </div>,
    );
    if (done) break;
    pos += 1;
    if (pos >= revealCount) break;
  }

  return <div style={containerStyle}>{lineElements}</div>;
}
