"use client";
import { useContext, useMemo } from "react";
import * as THREE from "three";
import { useGraphicsQuality } from "../GraphicsQuality";
import { MountainWindContext } from "./MountainWind";
import { MOUNTAIN_QUALITY, randomSequence } from "./mountainConfig";

const FALLS = [
  { position: [-22, 17, -38] as [number, number, number], height: 28, width: 2.7, rotation: .22 },
  { position: [24, 25, -62] as [number, number, number], height: 38, width: 3.2, rotation: -.28 },
  { position: [9, 30, -83] as [number, number, number], height: 22, width: 1.9, rotation: .04 },
];

function Mist({ count, origin }: { count: number; origin: [number, number, number] }) {
  const geometry = useMemo(() => {
    const random = randomSequence(origin[0] * 131 + origin[2] * 37 + count);
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = random() * 6;
      const angle = random() * Math.PI * 2;
      positions[i * 3] = origin[0] + Math.cos(angle) * radius;
      positions[i * 3 + 1] = origin[1] + random() * 5;
      positions[i * 3 + 2] = origin[2] + Math.sin(angle) * radius;
    }
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count, origin]);
  if (!count) return null;
  return <points geometry={geometry}><pointsMaterial color="#dbe8ea" size={.42} transparent opacity={.28} depthWrite={false} sizeAttenuation /></points>;
}

export default function MountainWaterfalls() {
  const { preset } = useGraphicsQuality();
  const wind = useContext(MountainWindContext);
  const quality = MOUNTAIN_QUALITY[preset];
  const uniforms = useMemo(() => ({ time: wind ?? { value: 0 }, water: { value: new THREE.Color("#9ebec7") } }), [wind]);
  return <group name="mountain-waterfalls">
    {FALLS.map((fall, index) => <group key={index} position={fall.position} rotation={[0, fall.rotation, 0]}>
      <mesh position={[0, -fall.height * .5, 0]} renderOrder={8}>
        <planeGeometry args={[fall.width, fall.height, 8, 48]} />
        <shaderMaterial transparent depthWrite={false} side={2} uniforms={uniforms} vertexShader="uniform float time;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.x+=sin(time*4.+uv.y*30.)*.08*(1.-abs(uv.x-.5));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}" fragmentShader="uniform vec3 water;uniform float time;varying vec2 vUv;void main(){float streak=sin((vUv.y-time*.7)*85.+sin(vUv.x*18.))*.5+.5;float edge=smoothstep(0.,.15,vUv.x)*smoothstep(1.,.85,vUv.x);float foam=smoothstep(.72,1.,streak)*.35;gl_FragColor=vec4(mix(water,vec3(.94),foam),edge*(.32+foam*.42));}" />
      </mesh>
      <Mist count={Math.floor(quality.mist / (index + 1.4))} origin={[0, -fall.height + 1.2, 0]} />
    </group>)}
  </group>;
}
