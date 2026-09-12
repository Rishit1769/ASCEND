"use client";
import MountainAtmosphere from "./MountainAtmosphere";
import MountainBridge from "./MountainBridge";
import MountainCliffs from "./MountainCliffs";
import MountainClouds from "./MountainClouds";
import MountainParticles from "./MountainParticles";
import MountainTemple from "./MountainTemple";
import MountainTerrain from "./MountainTerrain";
import MountainVegetation from "./MountainVegetation";
import MountainWaterfalls from "./MountainWaterfalls";
import MountainWind from "./MountainWind";

export default function MountainsOfTrial() {
  return <MountainWind>
    <group name="mountains-of-trial-environment">
      <MountainAtmosphere />
      <MountainClouds />
      <MountainTerrain />
      <MountainCliffs />
      <MountainVegetation />
      <MountainBridge />
      <MountainWaterfalls />
      <MountainTemple />
      <MountainParticles />
    </group>
  </MountainWind>;
}
