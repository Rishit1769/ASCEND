"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ShaderMaterial, DoubleSide } from "three";
import { Batch, type Part } from "./RealmMeshes";
import { REALM_QUALITY } from "./realmConfig";
import { useGraphicsQuality } from "../GraphicsQuality";
import { useReducedMotion } from "../useReducedMotion";
function Waterfall({ x, y, z }: { x: number; y: number; z: number }) {
  const ref = useRef<ShaderMaterial>(null), reduced = useReducedMotion();
  const uniforms = useMemo(() => ({ time: { value: 0 } }), []);
  useFrame((_, dt) => { if (ref.current && !reduced) ref.current.uniforms.time.value += Math.min(dt, .05); });
  return <mesh position={[x, y - 17, z]}>
    <planeGeometry args={[1.8, 30]} />
    <shaderMaterial ref={ref} uniforms={uniforms} side={DoubleSide} transparent depthWrite={false}
      vertexShader="varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}"
      fragmentShader="uniform float time;varying vec2 v;void main(){float e=sin(v.x*3.14159);float s=.65+.2*sin(v.x*65.+v.y*7.+time*1.4);gl_FragColor=vec4(.73,.87,.93,e*s*smoothstep(0.,.65,v.y)*.48);}" />
  </mesh>;
}
export default function FloatingIslands() {
  const { preset } = useGraphicsQuality();
  const quality = REALM_QUALITY[preset];
  const positions = useMemo(() => [
    [-52, 1, -44], [55, -3, -68], [0, 0, 65], [-70, 7, -105], [-58, -2, 45], [66, 3, 18],
  ].slice(0, quality.islands), [quality.islands]);
  const bases = positions.map(([x, y, z]): Part => ({ p: [x, y - 4, z], s: [14, 9, 11], r: [Math.PI, .3, 0] }));
  return <group name="distant-islands">
    <Batch parts={bases} shape="cone" material="dark" />
    <Batch parts={positions.map(([x, y, z]) => ({ p: [x, y + 1, z], s: [13, 1, 10] }))} shape="column" material="shade" />
    <Batch parts={positions.map(([x, y, z]) => ({ p: [x, y + 5, z], s: [2.5, 7, 2.5] }))} />
    <Batch parts={positions.map(([x, y, z]) => ({ p: [x, y + 9.5, z], s: [3.5, 2, 3.5] }))} material="gold" shape="cone" />
    {positions.slice(0, 4).map(([x, y, z]) => <Waterfall key={x} x={x + 4} y={y + 1} z={z + 3} />)}
    <Batch shape="cloud" material="shade" parts={Array.from({ length: quality.clouds }, (_, i) => {
      const a = i * Math.PI * 2 / quality.clouds;
      return { p: [Math.cos(a) * 72, -23 - i % 3, -30 + Math.sin(a) * 82], s: [65, 5, 40] };
    })} />
  </group>;
}
