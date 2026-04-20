import { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { seededPrng } from './seededPrng';

export interface UseCharRevealOptions {
  text: string;
  startFrame?: number;
  charsPerSecond?: number;
  jitter?: number;
  seed?: number;
}

export function useCharReveal({
  text,
  startFrame = 0,
  charsPerSecond = 40,
  jitter = 0,
  seed = 1,
}: UseCharRevealOptions): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const revealFrames = useMemo(() => {
    const baseFramesPerChar = fps / Math.max(0.0001, charsPerSecond);
    const rng = seededPrng(seed);
    const frames = new Array<number>(text.length);
    let cumulative = startFrame;
    for (let i = 0; i < text.length; i++) {
      const jitterOffset =
        jitter > 0 ? (rng() * 2 - 1) * jitter * baseFramesPerChar : 0;
      cumulative += Math.max(0, baseFramesPerChar + jitterOffset);
      frames[i] = cumulative;
    }
    return frames;
  }, [text, startFrame, charsPerSecond, jitter, seed, fps]);

  let visible = 0;
  for (let i = 0; i < revealFrames.length; i++) {
    if (revealFrames[i] <= frame) {
      visible = i + 1;
    } else {
      break;
    }
  }
  return visible;
}
