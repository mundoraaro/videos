import React from 'react'; import {AbsoluteFill, OffthreadVideo, Audio, staticFile, useCurrentFrame, interpolate} from 'remotion'; import {Subtitulos, Palabra} from './Subtitulos';
export type ShortProps={video:string;audio:string;palabras:Palabra[]};
// Composición final: capa 3D (render Three.js) + subtítulos animados + mezcla de audio + fundido de salida
export const Short:React.FC<ShortProps>=({video,audio,palabras})=>{ const f=useCurrentFrame();
  return <AbsoluteFill style={{background:'#000'}}>
    <OffthreadVideo src={staticFile(video)} muted/>
    <Subtitulos palabras={palabras}/>
    <Audio src={staticFile(audio)}/>
    <AbsoluteFill style={{background:'#000',opacity:interpolate(f,[0,4],[1,0],{extrapolateRight:'clamp'})}}/>
  </AbsoluteFill>; };
