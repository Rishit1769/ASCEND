"use client";

import { useMemo } from "react";
import { BackSide, Color } from "three";
import { useWorldProgress } from "../WorldProgress";
import { resolveWorld } from "@/lib/world";
import { useGraphicsQuality } from "../GraphicsQuality";

const checkpoints = [8, -8, -23, -38, -52];

function CloudSea() {
  const { preset } = useGraphicsQuality();
  const cloudCount = preset === "potato" ? 5 : preset === "low" ? 8 : 12;
  const clouds = useMemo(() => Array.from({ length: cloudCount }, (_, i) => ({
    x: ((i * 17) % 70) - 35, z: -65 + ((i * 29) % 85), y: -6.8 + (i % 3) * .35, s: 5 + (i % 4) * 1.8,
  })), [cloudCount]);
  return <group name="realm-cloud-sea">
    <mesh rotation-x={-Math.PI / 2} position={[0, -7.8, -24]}><planeGeometry args={[180, 190]} /><meshBasicMaterial color="#8c9eae" transparent opacity={.72} /></mesh>
    {clouds.map(cloud => <mesh key={`${cloud.x}-${cloud.z}`} position={[cloud.x, cloud.y, cloud.z]} scale={[cloud.s, 1, cloud.s * .58]}>
      <sphereGeometry args={[1, 12, 6]} /><meshBasicMaterial color="#c8d2d8" transparent opacity={.42} depthWrite={false} />
    </mesh>)}
  </group>;
}

function Pillar({ position, height = 5, accent = false }: { position: [number, number, number]; height?: number; accent?: boolean }) {
  return <group position={position} userData={{ cameraObstacle: true }}>
    <mesh castShadow receiveShadow position={[0, height / 2, 0]}><boxGeometry args={[1.15, height, 1.15]} /><meshStandardMaterial color={accent ? "#a68b57" : "#bfc2c4"} roughness={.64} metalness={accent ? .25 : .05} /></mesh>
    <mesh castShadow receiveShadow position={[0, height + .22, 0]}><boxGeometry args={[1.7, .44, 1.7]} /><meshStandardMaterial color="#d8d4c8" roughness={.72} /></mesh>
  </group>;
}

function Landmark({ level }: { level: number }) {
  const local = level - 11;
  const z = checkpoints[local] ?? checkpoints[0];
  const scale = 1 + local * .12;
  return <group position={[0, 0, z]} scale={scale} name={`realm-landmark-${level}`} userData={{ cameraObstacle: true }}>
    <mesh castShadow receiveShadow position={[0, .35, 0]}><boxGeometry args={[9, .7, 7]} /><meshStandardMaterial color="#aaaeb3" roughness={.8} /></mesh>
    <Pillar position={[-3.4, .7, -2.2]} height={4.4 + local * .35} />
    <Pillar position={[3.4, .7, -2.2]} height={4.4 + local * .35} accent={local > 1} />
    {local === 0 || local === 4 ? <>
      <mesh castShadow position={[0, 4.8 + local * .35, -2.2]}><boxGeometry args={[7.9, .75, .65]} /><meshStandardMaterial color="#d7d0bd" roughness={.65} /></mesh>
      <mesh position={[0, 5.45 + local * .35, -2.55]}><torusGeometry args={[1.35, .09, 8, 32]} /><meshStandardMaterial color="#c5a665" emissive="#5a3e16" emissiveIntensity={.45} metalness={.7} roughness={.3} /></mesh>
    </> : <mesh castShadow position={[0, 3.1 + local * .35, -2.2]}><coneGeometry args={[2.6, 4.5, 4]} /><meshStandardMaterial color="#c5c7c9" roughness={.68} /></mesh>}
  </group>;
}

function FloatingRuins() {
  const ruins = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    x: ((i * 19) % 70) - 35, y: 5 + (i % 4) * 1.4, z: -62 + ((i * 23) % 90), rotation: i * .7,
  })), []);
  return <group name="realm-floating-ruins">
    {ruins.map((ruin, i) => <group key={i} position={[ruin.x, ruin.y, ruin.z]} rotation={[0, ruin.rotation, .15]}>
      <mesh><boxGeometry args={[3 + i % 3, .65, 2]} /><meshStandardMaterial color="#667486" roughness={.92} /></mesh>
      {i % 2 === 0 && <mesh position={[0, .7, 0]}><boxGeometry args={[.6, 1.7, .6]} /><meshStandardMaterial color="#89929e" roughness={.86} /></mesh>}
    </group>)}
  </group>;
}

export default function RealmOfAscension() {
  const { level } = useWorldProgress();
  const { checkpoint } = resolveWorld(level);
  const tint = useMemo(() => new Color("#74869a"), []);
  return <group name="realm-of-ascension-environment">
    <CloudSea />
    <mesh position={[0, 8, -55]} scale={[120, 60, 1]} renderOrder={-20}><planeGeometry args={[2, 2]} /><meshBasicMaterial color={tint} transparent opacity={.46} side={BackSide} depthWrite={false} /></mesh>
    <Landmark level={checkpoint.level} />
    <FloatingRuins />
    <group name="realm-horizon-pillars">
      {[-32, -18, 18, 32].map((x, i) => <Pillar key={x} position={[x, -1, -67 - (i % 2) * 10]} height={10 + (i % 3) * 3} accent={i === 1} />)}
    </group>
  </group>;
}
