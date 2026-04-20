import { Composition } from 'remotion';
import { DemoComposition } from './DemoComposition';
import { TodosAppComposition } from './TodosAppComposition';

export function Root() {
  return (
    <>
      <Composition
        id="Demo"
        component={DemoComposition}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TodosApp"
        component={TodosAppComposition}
        durationInFrames={1350}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
}
