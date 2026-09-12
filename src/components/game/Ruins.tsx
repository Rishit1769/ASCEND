"use client";
import { useMemo } from "react";
import { AssetLOD, AssetScatter, EnvironmentAsset } from "./EnvironmentAsset";
import { useGraphicsQuality } from "./GraphicsQuality";
import { useGroundHeight } from "./terrainSurface";

const CLUSTERS = [[-3.8, 1.1], [3.6, -2.5], [-4.6, -6.4], [2.9, -10], [-3.2, -15], [4.5, -18]];
const random = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export default function Ruins() {
  const quality = useGraphicsQuality();
  const ground = useGroundHeight();
  const plants = useMemo(() => CLUSTERS.flatMap(([x, z], cluster) =>
    Array.from({ length: quality === "high" ? 15 : quality === "medium" ? 9 : 4 }, (_, i) => {
      const seed = cluster * 31 + i;
      const angle = random(seed) * Math.PI * 2;
      const radius = Math.sqrt(random(seed + 70)) * 1.5;
      return { position: [x + Math.cos(angle) * radius, 0, z + Math.sin(angle) * radius] as [number, number, number], scale: .45 + random(seed + 101) * .8, rotation: angle };
    })), [quality]);
  const stones = useMemo(() => Array.from({ length: quality === "low" ? 16 : 40 }, (_, i) => {
    const z = 2 - i * .48;
    const edge = Math.sin(z * .23) * .65 + (i % 2 ? 1 : -1) * (1.6 + random(i) * .8);
    return { position: [edge, 0, z] as [number, number, number], scale: .12 + random(i + 53) * .34, rotation: i * 2.4 };
  }), [quality]);
  return (
    <group name="shore-architecture-and-vegetation">
      {/* Two surviving masonry fragments mark the former processional route. */}
      <EnvironmentAsset id="modular_fort_01" part="modular_fort_01_wall_thick_end_01" height={1.35} position={[-5.1, ground(-5.1, -6) - .15, -6]} rotation={.5} castShadow />
      <EnvironmentAsset id="modular_fort_01" part="modular_fort_01_wall_thin_corner_02" height={1.05} position={[5, ground(5, -10) - .2, -10]} rotation={-.8} />
      <AssetLOD id="coastal_cliff_02" width={7.3} position={[-8, -2.5, -5]} rotation={1.7} tint="#b8bdba" />
      <AssetLOD id="coastal_cliff_02" width={6.2} position={[8, -2.4, -9]} rotation={-1.4} />
      {["a", "b", "c", "d"].map((variant, i) => <AssetScatter key={variant} id="fern_02" part={`fern_02_${variant}`} height={.58} surface placements={plants.filter((_, j) => j % 4 === i)} />)}
      {[1, 2, 3, 4, 5, 6].map((variant, i) => <AssetScatter key={variant} id="rock_moss_set_01" part={`rock_moss_set_01_rock0${variant}`} width={1.3} surface placements={stones.filter((_, j) => j % 6 === i)} />)}
      <EnvironmentAsset id="rock_moss_set_01" part="rock_moss_set_01_rock03" width={2} position={[-3.7, ground(-3.7, .4) - .15, .4]} rotation={.8} castShadow />
      <EnvironmentAsset id="rock_moss_set_01" part="rock_moss_set_01_rock05" width={1.7} position={[3.8, ground(3.8, -2) - .15, -2]} rotation={2.3} castShadow />
      <EnvironmentAsset id="tree_small_02" height={9.5} position={[-8, ground(-8, -13) - .2, -13]} rotation={1.6} castShadow={quality !== "low"} />
      <EnvironmentAsset id="tree_small_02" low height={6.8} position={[-6.2, ground(-6.2, -16) - .2, -16]} rotation={-.5} />
      <EnvironmentAsset id="tree_small_02" low height={10} position={[11, ground(11, -23) - .2, -23]} rotation={2.7} />
      {quality !== "low" && <EnvironmentAsset id="tree_small_02" low height={5.6} position={[8, ground(8, -25) - .2, -25]} rotation={.8} />}
    </group>
  );
}
