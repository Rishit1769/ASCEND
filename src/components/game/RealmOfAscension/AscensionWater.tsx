"use client";
import TidalWater from "../TidalWater";
import { useGraphicsQuality } from "../GraphicsQuality";
import { PALETTE } from "./realmConfig";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
export default function AscensionWater() {
  const { config, preset } = useGraphicsQuality();
  const gl = useThree(state => state.gl);
  useEffect(() => {
    if (!config.waterDetailEnabled) gl.domElement.setAttribute("data-water-state", JSON.stringify({ detail: false, realtimeReflection: false, resolution: 0, preset }));
  }, [config.waterDetailEnabled, preset, gl]);
  if (config.waterDetailEnabled) return <TidalWater realm />;
  return <group name="simple-ascension-pools">{[-1, 1].map(side =>
    <mesh key={side} position={[side * 10.6, -.12, -16]} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[14.8, 28]} />
      {preset === "potato" ? <meshBasicMaterial color={PALETTE.water} transparent opacity={.6} depthWrite={false} /> :
        <meshStandardMaterial color={PALETTE.water} roughness={.32} metalness={.12} transparent opacity={.66} depthWrite={false} />}
    </mesh>)}</group>;
}
