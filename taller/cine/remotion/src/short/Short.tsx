import React from 'react'; import {AbsoluteFill, OffthreadVideo, Audio, staticFile, useCurrentFrame, interpolate} from 'remotion'; import {Subtitulos, Palabra} from './Subtitulos';
export type ShortProps={video:string;audio:string;palabras:Palabra[];clave?:string};
// Composición final: capa 3D (render Three.js) + subtítulos animados + mezcla de audio + fundido de salida
export const Short:React.FC<ShortProps>=({video,audio,palabras,clave})=>{ const f=useCurrentFrame();
  return <AbsoluteFill style={{background:'#000'}}>
    <OffthreadVideo src={staticFile(video)} muted/>
    <Subtitulos palabras={palabras} clave={clave}/>
    <Audio src={staticFile(audio)}/>
  </AbsoluteFill>; };
