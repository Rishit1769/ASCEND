"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "./useReducedMotion";

export default function AtmosphericSky({ capture = false }: { capture?: boolean }) {
  const reduced = useReducedMotion();
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ time: { value: 0 } }), []);
  useFrame((_, delta) => {
    if (!reduced && material.current) material.current.uniforms.time.value += Math.min(delta, 0.05) * 0.007;
  });
  return (
    <mesh renderOrder={-100}>
      <sphereGeometry args={[180, 32, 16]} />
      <shaderMaterial ref={material} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} toneMapped={!capture}
        vertexShader={`
          varying vec3 direction;
          void main() {
            direction = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
          }
        `}
        fragmentShader={`
          uniform float time;
          varying vec3 direction;
          float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float noise(vec2 p) {
            vec2 i = floor(p), f = fract(p);
            f = f*f*(3.-2.*f);
            return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
          }
          float cloudNoise(vec2 p) {
            float value=0., weight=.5;
            for(int i=0;i<6;i++) { value += noise(p)*weight; p=mat2(.8,-.6,.6,.8)*p*2.04+vec2(3.1,8.7); weight*=.5; }
            return value;
          }
          void main() {
            vec3 d = normalize(direction);
            vec2 p = d.xz / (abs(d.y)+0.22) * 3.3 + vec2(time, time*0.23);
            p += vec2(noise(p*.7),noise(p*.7+vec2(18.,4.)))*1.4;
            float n = cloudNoise(p);
            float high = noise(p*.52 + vec2(8., time*.5));
            float opening = exp(-pow(distance(d, normalize(vec3(.25,.25,-1.))) * 2.4, 2.));
            float clouds = smoothstep(.33,.65,n + high*.13 - opening*.18);
            vec3 sky = mix(vec3(.28,.38,.48),vec3(.075,.16,.29),smoothstep(0.,.8,d.y));
            vec3 cloud = mix(vec3(.045,.071,.10), vec3(.32,.37,.40), smoothstep(.15,.78,high));
            sky = mix(sky, cloud, clouds*.94);
            float silver = smoothstep(.36,.48,n)*(1.-smoothstep(.48,.56,n));
            sky += vec3(.19,.21,.22) * silver * (.25+opening);
            sky += vec3(1.05,.75,.39) * opening * (1.-clouds) * .65;
            sky *= .8;
            gl_FragColor = vec4(sky,1.);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `}
      />
    </mesh>
  );
}
