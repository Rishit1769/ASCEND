"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "./useReducedMotion";

export default function AtmosphericSky() {
  const reduced = useReducedMotion();
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ time: { value: 0 } }), []);
  useFrame((_, delta) => {
    if (!reduced && material.current) material.current.uniforms.time.value += Math.min(delta, 0.05) * 0.007;
  });
  return (
    <mesh renderOrder={-100}>
      <sphereGeometry args={[180, 32, 16]} />
      <shaderMaterial ref={material} uniforms={uniforms} side={THREE.BackSide} depthWrite={false}
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
          void main() {
            vec3 d = normalize(direction);
            vec2 p = d.xz / (abs(d.y)+0.28) * 3.0 + vec2(time, time*0.23);
            float n = noise(p)*0.55 + noise(p*2.03)*0.27 + noise(p*4.07)*0.13 + noise(p*8.1)*0.05;
            vec3 sky = mix(vec3(0.26,0.32,0.36),vec3(0.038,0.065,0.105),smoothstep(0.,0.8,d.y));
            sky = mix(sky, vec3(0.09,0.12,0.15),smoothstep(0.36,0.74,n)*0.74);
            sky += vec3(0.06,0.065,0.07)*smoothstep(0.5,0.6,n)*(1.-smoothstep(0.6,0.7,n));
            gl_FragColor = vec4(sky,1.);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `}
      />
    </mesh>
  );
}
