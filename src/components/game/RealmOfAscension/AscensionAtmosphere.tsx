"use client";
import { useMemo, useRef } from "react";
import { BackSide, Color, ShaderMaterial, Object3D } from "three";
import { useFrame } from "@react-three/fiber";
import { useGraphicsQuality } from "../GraphicsQuality";
import { useReducedMotion } from "../useReducedMotion";
import { PALETTE } from "./realmConfig";

export function AscensionLighting() {
  const { config } = useGraphicsQuality();
  const target = useMemo(() => { const o = new Object3D(); o.position.set(0, 4, -26); return o; }, []);
  return <>
    <primitive object={target} />
    {/* Low cool sky fill — deliberately weak so shadows keep their depth. */}
    <hemisphereLight args={["#A9C7D8", "#5C6670", .1]} />
    {/* Main warm sunlight, low raking angle so vertical architecture catches it. */}
    <directionalLight position={[44, 30, 32]} target={target} intensity={2.3} color={PALETTE.sunlight}
      castShadow={config.shadowsEnabled} shadow-mapSize={config.shadowMapSize}
      shadow-camera-left={-42} shadow-camera-right={42} shadow-camera-top={60} shadow-camera-bottom={-36}
      shadow-camera-far={180} shadow-normalBias={.035} shadow-bias={-.00015} />
    {/* Cool sky bounce from the opposite side, kept subtle. */}
    <directionalLight position={[-28, 20, -16]} intensity={.15} color="#9FC3DD" />
    {/* Warm rim from behind the temple to separate ivory architecture from the sky. */}
    <directionalLight position={[8, 16, -52]} intensity={.32} color="#FFC98A" />
  </>;
}
export default function AscensionAtmosphere({ capture = false }: { capture?: boolean }) {
  const material = useRef<ShaderMaterial>(null);
  const reduced = useReducedMotion();
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    sky: { value: new Color(PALETTE.sky) },
    skyMid: { value: new Color(PALETTE.skyMid) },
    cloud: { value: new Color(PALETTE.cloud) },
    horizon: { value: new Color(PALETTE.skyHorizon) },
  }), []);
  useFrame((_, dt) => { if (material.current && !reduced && !capture) material.current.uniforms.time.value += Math.min(dt, .05); });
  return <mesh renderOrder={-100}>
    <sphereGeometry args={[350, 32, 16]} />
    <shaderMaterial ref={material} side={BackSide} depthWrite={false} uniforms={uniforms}
      vertexShader="varying vec3 d;void main(){d=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}"
      fragmentShader={`varying vec3 d;uniform float time;uniform vec3 sky,skyMid,cloud,horizon;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
        void main(){
          vec3 v=normalize(d);
          float h=clamp(v.y,0.,1.);
          // Three-stop vertical gradient: pale horizon -> mid blue -> deep zenith blue.
          // The blue is reached quickly so it reads at shallow camera angles.
          vec3 base=mix(horizon,skyMid,smoothstep(.0,.12,h));
          base=mix(base,sky,smoothstep(.12,.40,h));
          vec2 p=v.xz/(abs(v.y)+.28)*3.+vec2(time*.002,0.);
          float n=noise(p)*.6+noise(p*2.2)*.27+noise(p*5.)*.13;
          float banks=smoothstep(.54,.84,n);
          // Restrained cloud cover so the sky stays blue rather than white.
          vec3 c=mix(base,cloud,.06+banks*.42);
          // Low-altitude haze near the horizon.
          c=mix(c,horizon,(1.-smoothstep(-.02,.12,h))*.38);
          // Tight sun disc.
          float sun=pow(max(dot(v,normalize(vec3(.42,.42,.32))),0.),260.);
          c+=vec3(.5,.34,.16)*sun;
          gl_FragColor=vec4(c,1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`} />
  </mesh>;
}
