import React from 'react'; import {Composition} from 'remotion'; import {Short, ShortProps} from './short/Short';
import tl from '../public/actual/timeline.json';
export const Root: React.FC = () => <>
  <Composition id="Short" component={Short} durationInFrames={Math.round((tl as any).duration*30)} fps={30} width={1080} height={1920}
    defaultProps={{video:'actual/video_mudo.mp4',audio:'actual/mezcla.wav',palabras:(tl as any).words,clave:(tl as any).clave} as ShortProps}/>
</>;
