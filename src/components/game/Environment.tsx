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
import type { RegionSlug } from "@/types/game";
import ForestOfResolve from "./ForestOfResolve";
import RealmOfAscension from "./RealmOfAscension";

interface EnvironmentProps {
  region?: RegionSlug;
}

export default function Environment({ region = "forgotten-shore" }: EnvironmentProps) {
  const reducedMotion = useReducedMotion();
  const { config } = useGraphicsQuality();

  if (region === "forest-of-resolve") return <ForestOfResolve />;
  if (region === "realm-of-ascension") return <RealmOfAscension />;
  if (region !== "forgotten-shore") {
    return null;
  }

  return (
    <group name={`environment-${region}`}>
      <Terrain />
      <TidalWater />
      <DistantMountain />
      <Ruins />
      <FogLayers reducedMotion={reducedMotion} />
      {config.particlesEnabled && <AmbientParticles reducedMotion={reducedMotion} />}
      {config.distantFires && <DistantFires reducedMotion={reducedMotion} />}
    </group>
  );
}
