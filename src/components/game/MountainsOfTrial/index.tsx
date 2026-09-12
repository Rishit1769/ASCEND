"use client";
import { useWorldProgress } from "../WorldProgress";
import { useGraphicsQuality } from "../GraphicsQuality";
import MountainTerrain from "./MountainTerrain";
import MountainCliffs from "./MountainCliffs";
import MountainBridge from "./MountainBridge";
import MountainTemple from "./MountainTemple";
import MountainVegetation from "./MountainVegetation";
import MountainWaterfalls from "./MountainWaterfalls";
import MountainClouds from "./MountainClouds";
import MountainAtmosphere from "./MountainAtmosphere";
import MountainWind from "./MountainWind";
import type { RegionSlug } from "@/types/game";

interface MountainsOfTrialProps {
  region?: RegionSlug;
}

export default function MountainsOfTrial({ region }: MountainsOfTrialProps) {
  const { level } = useWorldProgress();
  const { preset } = useGraphicsQuality();

  if (region !== "mountains-of-trial") return null;

  return (
    <group name="mountains-of-trial-environment">
      <MountainAtmosphere level={level} />
      <MountainCliffs level={level} />
      <MountainTerrain level={level} />
      <MountainVegetation level={level} />
      <MountainClouds level={level} />

      {level >= 13 && <MountainBridge level={level} />}
      {level >= 14 && <MountainWaterfalls level={level} />}
      {level >= 15 && <MountainTemple level={level} />}

      <MountainWind>
        {null}
      </MountainWind>
    </group>
  );
}
