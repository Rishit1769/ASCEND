"use client";
import ForestTerrain from "./ForestTerrain";
import ForestTrees from "./ForestTrees";
import ForestRuins from "./ForestRuins";
import ForestWater from "./ForestWater";
import ForestAtmosphere from "./ForestAtmosphere";
import { ForestWind } from "./ForestWind";
import ForestCameraGuard from "./ForestCameraGuard";
import ForestHorizon from "./ForestHorizon";

export default function ForestOfResolve() {
  return <ForestWind><group name="forest-of-resolve-environment">
    <ForestHorizon /><ForestTerrain /><ForestTrees /><ForestRuins /><ForestWater /><ForestAtmosphere /><ForestCameraGuard />
  </group></ForestWind>;
}
