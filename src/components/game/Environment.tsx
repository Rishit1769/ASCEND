"use client";

import DistantFires from "./DistantFires";
import DistantMountain from "./DistantMountain";
import FogLayers from "./FogLayers";
import AmbientParticles from "./AmbientParticles";
import { useReducedMotion } from "./useReducedMotion";

export type EnvironmentRegion =
  | "forgotten_shore"
  | "forest_of_resolve"
  | "mountains_of_trial"
  | "temple_of_knowledge"
  | "summit";

interface EnvironmentProps {
  region?: EnvironmentRegion;
}

function ShoreRuins() {
  return (
    <group>
      <mesh position={[-4.7, -0.72, -3.7]} rotation={[0.1, 0.2, -0.08]}>
        <dodecahedronGeometry args={[0.75, 0]} />
        <meshStandardMaterial color="#252b36" roughness={1} flatShading />
      </mesh>
      <mesh position={[4.6, -0.82, -4.2]} rotation={[-0.1, -0.2, 0.1]}>
        <dodecahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial color="#202632" roughness={1} flatShading />
      </mesh>
      <mesh position={[-2.8, -0.95, -5.1]} rotation={[0, 0.5, 0.1]}>
        <boxGeometry args={[2.2, 0.22, 0.5]} />
        <meshStandardMaterial color="#1b202b" roughness={1} />
      </mesh>
      <mesh position={[2.9, -0.94, -5.2]} rotation={[0, -0.4, -0.06]}>
        <boxGeometry args={[1.8, 0.2, 0.45]} />
        <meshStandardMaterial color="#1b202b" roughness={1} />
      </mesh>
    </group>
  );
}

export default function Environment({ region = "forgotten_shore" }: EnvironmentProps) {
  const reducedMotion = useReducedMotion();

  if (region !== "forgotten_shore") {
    return null;
  }

  return (
    <group name={`environment-${region}`}>
      <DistantMountain />
      <ShoreRuins />
      <FogLayers reducedMotion={reducedMotion} />
      <AmbientParticles reducedMotion={reducedMotion} />
      <DistantFires reducedMotion={reducedMotion} />
    </group>
  );
}
