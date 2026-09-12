"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGraphicsQuality } from "./GraphicsQuality";

interface FogLayersProps {
  reducedMotion: boolean;
}

type Layer = { position: [number, number, number]; scale: [number, number, number]; opacity: number };
const LAYERS: Layer[] = [
  { position: [-14, 3, -51], scale: [48, 9, 1], opacity: .65 },
  { position: [17, 2, -43], scale: [35, 8, 1], opacity: .55 },
  { position: [-6, .5, -27], scale: [24, 4.5, 1], opacity: .46 },
  { position: [8, .2, -23], scale: [22, 4, 1], opacity: .4 },
  { position: [-5, -.4, -15], scale: [15, 2, 1], opacity: .28 },
  { position: [5, -.7, -10], scale: [11, 1.6, 1], opacity: .22 },
  { position: [-3, -.7, -5], scale: [8, 1, 1], opacity: .12 },
];

function Mist({ layer, index, reducedMotion, shaft = false }: { layer: Layer; index: number; reducedMotion: boolean; shaft?: boolean }) {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ time: { value: index * 19 }, opacity: { value: layer.opacity }, tint: { value: new THREE.Color(shaft ? "#ffe2b4" : "#9eb8c7") } }), [index, layer.opacity, shaft]);
  useFrame((_, delta) => {
    if (!reducedMotion && ref.current) ref.current.uniforms.time.value += Math.min(delta, .05) * .07;
  });
  return <mesh position={layer.position} scale={layer.scale} rotation={[0, 0, shaft ? -.25 : 0]}>
    <planeGeometry />
    <shaderMaterial ref={ref} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide}
      blending={shaft ? THREE.AdditiveBlending : THREE.NormalBlending}
      vertexShader={`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`}
      fragmentShader={`
        varying vec2 vUv; uniform float time; uniform float opacity; uniform vec3 tint;
        float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
        void main(){
          vec2 p=vUv*vec2(6.,3.)+vec2(time,time*.17);
          float n=noise(p)*.55+noise(p*2.1)*.3+noise(p*4.3)*.15;
          vec2 q=vUv*2.-1.;
          float edge=pow(max(0.,1.-dot(q,q)),2.);
          float alpha=edge*smoothstep(.18,.8,n)*opacity;
          gl_FragColor=vec4(tint,alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        `}
    />
  </mesh>;
}

export default function FogLayers({ reducedMotion }: FogLayersProps) {
  const { config } = useGraphicsQuality();
  const layerCount = config.fogLayers;
  return (
    <>
      {LAYERS.slice(0, layerCount).map((layer, index) => (
        <Mist key={index} layer={layer} index={index} reducedMotion={reducedMotion} />
      ))}
      {config.fogShaft && (
        <Mist layer={{ position: [3, 9, -31], scale: [7, 21, 1], opacity: .095 }} index={8} reducedMotion={reducedMotion} shaft />
      )}
    </>
  );
}
