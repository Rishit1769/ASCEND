"use client";

import DistantFires from "./DistantFires";
import DistantMountain from "./DistantMountain";
import FogLayers from "./FogLayers";
import AmbientParticles from "./AmbientParticles";
import Ruins from "./Ruins";
import Terrain from "./Terrain";
import { useReducedMotion } from "./useReducedMotion";
import { useGraphicsQuality } from "./GraphicsQuality";
import TidalWater from "./TidalWater";

export type EnvironmentRegion =
  | "forgotten_shore"
  | "forest_of_resolve"
  | "mountains_of_trial"
  | "temple_of_knowledge"
  | "realm_of_ascension"
  | "summit";

interface EnvironmentProps {
  region?: EnvironmentRegion;
}

export default function Environment({ region = "forgotten_shore" }: EnvironmentProps) {
  const reducedMotion = useReducedMotion();
  const quality = useGraphicsQuality();

  if (region !== "forgotten_shore") {
    return null;
  }

  return (
    <group name={`environment-${region}`}>
      <Terrain />
      <TidalWater />
      <DistantMountain />
      <Ruins />
      <FogLayers reducedMotion={reducedMotion} />
      {quality !== "low" && <AmbientParticles reducedMotion={reducedMotion} />}
      <DistantFires reducedMotion={reducedMotion} />
    </group>
  );
}
