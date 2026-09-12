"use client";
import { useContext, useMemo } from "react";
import { Color } from "three";
import { useGraphicsQuality } from "../GraphicsQuality";
import { MountainWindContext } from "./MountainWind";
import { MOUNTAIN_QUALITY } from "./mountainConfig";

function Banner({ position, rotation = 0, scale = 1 }: { position: [number, number, number]; rotation?: number; scale?: number }) {
  const wind = useContext(MountainWindContext);
  const uniforms = useMemo(() => ({ time: wind ?? { value: 0 }, color: { value: new Color("#7e2d24") } }), [wind]);
  return <mesh position={position} rotation={[0, rotation, 0]} scale={[scale, scale, scale]} castShadow>
    <planeGeometry args={[1.2, 4.8, 8, 24]} />
    <shaderMaterial side={2} uniforms={uniforms} vertexShader="uniform float time;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.x+=sin(time*1.8+uv.y*10.)*.18*uv.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}" fragmentShader="uniform vec3 color;varying vec2 vUv;void main(){float fray=smoothstep(.04,.12,vUv.x)*smoothstep(.96,.84,vUv.x);gl_FragColor=vec4(color*(.75+vUv.y*.25),fray*.78);}" transparent depthWrite={false} />
  </mesh>;
}

function Guardian({ x }: { x: number }) {
  return <group position={[x, 20.4, -77]} rotation={[0, x > 0 ? -.18 : .18, 0]}>
    <mesh position={[0, 5.8, 0]} castShadow receiveShadow><cylinderGeometry args={[2.0, 2.9, 11.5, 8, 6]} /><meshStandardMaterial color="#858c8b" roughness={.94} /></mesh>
    <mesh position={[0, 12.4, 0]} castShadow receiveShadow><boxGeometry args={[4.4, 3.5, 2.7, 3, 3, 2]} /><meshStandardMaterial color="#8d9491" roughness={.92} /></mesh>
    <mesh position={[x > 0 ? -1.8 : 1.8, 5.5, 0]} rotation={[0, 0, x > 0 ? -.28 : .28]} castShadow receiveShadow><boxGeometry args={[1.1, 8.8, 1.1]} /><meshStandardMaterial color="#777f7e" roughness={.95} /></mesh>
    <mesh position={[0, -.3, 0]} castShadow receiveShadow><boxGeometry args={[6, 1.4, 4.2]} /><meshStandardMaterial color="#737d7d" roughness={.95} /></mesh>
  </group>;
}

export default function MountainTemple() {
  const { preset } = useGraphicsQuality();
  const quality = MOUNTAIN_QUALITY[preset];
  return <group name="mountain-gate-temple">
    <mesh position={[0, 29, -84]} castShadow={quality.shadowCasters} receiveShadow><boxGeometry args={[32, 25, 4, 6, 8, 2]} /><meshStandardMaterial color="#858e8c" roughness={.94} metalness={0} /></mesh>
    <mesh position={[0, 27, -81.7]}><boxGeometry args={[9, 12, .5]} /><meshBasicMaterial color="#c77938" transparent opacity={.38} /></mesh>
    <mesh position={[-10.2, 22, -69]} rotation={[-.42, 0, 0]} castShadow={quality.shadowCasters} receiveShadow><boxGeometry args={[3.2, 2.2, 24, 2, 2, 10]} /><meshStandardMaterial color="#929895" roughness={.92} /></mesh>
    <mesh position={[10.2, 22, -69]} rotation={[-.42, 0, 0]} castShadow={quality.shadowCasters} receiveShadow><boxGeometry args={[3.2, 2.2, 24, 2, 2, 10]} /><meshStandardMaterial color="#929895" roughness={.92} /></mesh>
    {[-10, -6, -2, 2, 6, 10].map((x, index) => <mesh key={index} position={[x, 19.8 + index * .08, -61 - index * 1.8]} castShadow={quality.shadowCasters} receiveShadow><boxGeometry args={[3.3, .45, 2.4]} /><meshStandardMaterial color="#8b918e" roughness={.96} /></mesh>)}
    <Guardian x={-10.5} />
    <Guardian x={10.5} />
    {preset !== "potato" && <>
      <Banner position={[-7.4, 29.5, -72]} rotation={.02} scale={1.2} />
      <Banner position={[7.4, 29.5, -72]} rotation={-.02} scale={1.2} />
      <Banner position={[-13.3, 22.8, -68]} rotation={.24} scale={.85} />
      <Banner position={[13.3, 22.8, -68]} rotation={-.24} scale={.85} />
    </>}
    <pointLight position={[0, 25.5, -72]} color="#f0a85b" intensity={preset === "potato" ? 10 : 26} distance={38} decay={2} />
    <mesh position={[0, 24.2, -73.2]}><boxGeometry args={[6.8, 8.5, .35]} /><meshBasicMaterial color="#d88d45" transparent opacity={.36} /></mesh>
  </group>;
}
