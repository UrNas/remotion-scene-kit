import { Easing, interpolate } from 'remotion';

const EASE_OUT = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
  easing: Easing.out(Easing.cubic),
} as const;

const CLAMP = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

export function fadeIn(
  frame: number,
  startFrame: number,
  durationFrames: number,
): number {
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    EASE_OUT,
  );
}

export function fadeOut(
  frame: number,
  startFrame: number,
  durationFrames: number,
): number {
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [1, 0],
    EASE_OUT,
  );
}

export type SlideDirection = 'left' | 'right' | 'top' | 'bottom';

export interface SlideInResult {
  translateX: number;
  translateY: number;
  opacity: number;
}

export function slideIn(
  frame: number,
  startFrame: number,
  durationFrames: number,
  direction: SlideDirection,
  distance = 40,
): SlideInResult {
  const t = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    EASE_OUT,
  );
  const dx =
    direction === 'left' ? -distance : direction === 'right' ? distance : 0;
  const dy =
    direction === 'top' ? -distance : direction === 'bottom' ? distance : 0;
  return {
    translateX: dx * (1 - t),
    translateY: dy * (1 - t),
    opacity: t,
  };
}

export interface CrossFadeResult {
  outOpacity: number;
  inOpacity: number;
}

export function crossFade(
  frame: number,
  startFrame: number,
  durationFrames: number,
): CrossFadeResult {
  const t = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    CLAMP,
  );
  return { outOpacity: 1 - t, inOpacity: t };
}
