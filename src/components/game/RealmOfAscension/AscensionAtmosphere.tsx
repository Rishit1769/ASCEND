"use client";
import { useMemo, useRef } from "react";
import { BackSide, Color, ShaderMaterial, Object3D } from "three";
import { useFrame } from "@react-three/fiber";
import { useGraphicsQuality } from "../GraphicsQuality";
import { useReducedMotion } from "../useReducedMotion";
import { PALETTE } from "./realmConfig";

export function AscensionLighting() {
  const { config } = useGraphicsQuality();
  const target = useMemo(() => { const o = new Object3D(); o.position.set(0, 4, -28); return o; }, []);
  return <>
    <primitive object={target} />
    <hemisphereLight args={["#e8f2ff", "#7d8b98", .85]} />
    <directionalLight position={[35, 65, 20]} target={target} intensity={1.9} color={PALETTE.light}
      castShadow={config.shadowsEnabled} shadow-mapSize={config.shadowMapSize}
      shadow-camera-left={-48} shadow-camera-right={48} shadow-camera-top={65} shadow-camera-bottom={-40}
      shadow-camera-far={180} shadow-normalBias={.035} shadow-bias={-.00015} />
  </>;
}
export default function AscensionAtmosphere({ capture = false }: { capture?: boolean }) {
  const material = useRef<ShaderMaterial>(null);
  const reduced = useReducedMotion();
  const uniforms = useMemo(() => ({ time: { value: 0 }, sky: { value: new Color(PALETTE.sky) }, cloud: { value: new Color("#e8f2ff") } }), []);
  useFrame((_, dt) => { if (material.current && !reduced && !capture) material.current.uniforms.time.value += Math.min(dt, .05); });
  return <mesh renderOrder={-100}>
    <sphereGeometry args={[350, 32, 16]} />
    <shaderMaterial ref={material} side={BackSide} depthWrite={false} uniforms={uniforms}
      vertexShader="varying vec3 d;void main(){d=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}"
      fragmentShader={`varying vec3 d;uniform float time;uniform vec3 sky,cloud;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
        void main(){vec3 v=normalize(d);vec2 p=v.xz/(abs(v.y)+.28)*3.+vec2(time*.002,0.);
          float n=noise(p)*.6+noise(p*2.2)*.27+noise(p*5.)*.13;
          float banks=smoothstep(.43,.74,n);
          vec3 c=mix(sky,cloud,.14+banks*.8);
          c=mix(c,cloud,(1.-smoothstep(-.5,-.15,v.y))*.35);
          float sun=pow(max(dot(v,normalize(vec3(.45,.55,.25))),0.),80.);
          c+=vec3(.28,.18,.065)*sun;
          gl_FragColor=vec4(c,1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`} />
  </mesh>;
}
