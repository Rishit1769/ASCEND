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
import MountainWorldShell from "./MountainWorldShell";
import MountainCameraSafety from "./MountainCameraSafety";
import MountainWorldDiagnostics from "./MountainWorldDiagnostics";

export default function MountainsOfTrial() {
  return <MountainWind>
    <group name="mountains-of-trial-environment">
      <MountainAtmosphere />
      <MountainClouds />
      <MountainTerrain />
      <MountainWorldShell />
      <MountainCliffs />
      <MountainVegetation />
      <MountainBridge />
      <MountainWaterfalls />
      <MountainTemple />
      <MountainParticles />
      <MountainCameraSafety />
      {process.env.NODE_ENV === "development" && <MountainWorldDiagnostics />}
    </group>
  </MountainWind>;
}
