import React from 'react'; import {Composition} from 'remotion'; import {Short, ShortProps} from './short/Short';
import tl from '../public/papel3/timeline.json';
export const Root: React.FC = () => <>
  <Composition id="Papel3" component={Short} durationInFrames={Math.round((tl as any).duration*30)} fps={30} width={1080} height={1920}
    defaultProps={{video:'papel3/video_mudo.mp4',audio:'papel3/mezcla.wav',palabras:(tl as any).words} as ShortProps}/>
</>;
