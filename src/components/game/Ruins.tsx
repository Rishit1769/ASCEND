"use client";
import { AssetLOD, AssetScatter, EnvironmentAsset } from "./EnvironmentAsset";
const FERNS = Array.from({ length: 24 }, (_, i) => ({
  position: [(i % 2 ? 1 : -1) * (2 + (i % 5) * 0.65), -1.05, 2 - Math.floor(i / 2) * 0.85] as [number, number, number],
  scale: 0.65 + (i % 4) * 0.17,
  rotation: i * 2.4,
}));
export default function Ruins() {
  return (
    <group name="shore-architecture-and-vegetation">
      <EnvironmentAsset id="modular_fort_01" part="modular_fort_01_wall_thick_end_01" height={2.4} position={[-4.6, -1.1, -6]} rotation={0.3} />
      <EnvironmentAsset id="modular_fort_01" part="modular_fort_01_wall_thin_corner_02" height={2.1} position={[5, -1.1, -8]} rotation={-0.6} />
      <AssetLOD id="coastal_cliff_02" width={10} position={[-7, -1.5, -4]} rotation={1.2} />
      <AssetLOD id="coastal_cliff_02" width={9} position={[7, -1.5, -7]} rotation={-1.1} />
      <AssetScatter id="fern_02" height={0.65} placements={FERNS} />
      <AssetScatter id="rock_moss_set_01" width={2.8} placements={[
        { position: [-2.8, -1.2, 0.3], rotation: 0.8 },
        { position: [3.4, -1.2, -0.8], rotation: 2.3, scale: 0.7 },
        { position: [-4, -1.3, -5], rotation: 4, scale: 1.2 },
        { position: [4, -1.3, -9], rotation: 1.4 },
      ]} />
      <EnvironmentAsset id="tree_small_02" height={8} position={[-7, -1.3, -12]} rotation={0.8} />
      <EnvironmentAsset id="tree_small_02" low height={11} position={[9, -1.4, -20]} rotation={-0.4} />
      <EnvironmentAsset id="tree_small_02" low height={9} position={[-10, -1.4, -27]} rotation={2.1} />
    </group>
  );
}
