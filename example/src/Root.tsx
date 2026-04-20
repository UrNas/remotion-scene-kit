import { Composition } from 'remotion';
import { DemoComposition } from './DemoComposition';

export function Root() {
  return (
    <Composition
      id="Demo"
      component={DemoComposition}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
  );
}
