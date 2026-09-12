"use client";
import { useMemo } from "react";
import { AssetScatter, GroundedAsset } from "../EnvironmentAsset";
import { useGraphicsQuality } from "../GraphicsQuality";
import { FOREST_QUALITY, forestHeight, pathX, randomSequence, streamZ } from "./forestConfig";

function placements(count: number, seed: number, trees = false) {
  const random = randomSequence(seed);
  const result: { position: [number, number, number]; scale: number; rotation: number }[] = [];
  for (let i = 0; result.length < count && i < count * 30; i++) {
    const z = 25 - random() * 92;
    const x = !trees && i % 2 === 0 ? (i % 4 ? -1 : 1) * (2.5 + random() * 4) + pathX(z) : (random() - .5) * (trees ? 76 : 38);
    const pathDistance = Math.abs(x - pathX(z));
    if (pathDistance < (trees ? 5.2 : 1.7) || Math.abs(z - streamZ(x)) < 2.4 || forestHeight(x, z) < 0) continue;
    if (Math.abs(x) < 9 && z < -32 && z > -49) continue;
    result.push({ position: [x, forestHeight(x, z) - .08, z], scale: trees ? .7 + random() * .85 : .5 + random() * .65, rotation: random() * Math.PI * 2 });
  }
  return result;
}
export default function ForestTrees() {
  const { preset, config } = useGraphicsQuality();
  const quality = FOREST_QUALITY[preset];
  const trees = useMemo(() => placements(quality.trees, 62, true), [quality.trees]);
  const ferns = useMemo(() => placements(quality.ferns, 719), [quality.ferns]);
  const rocks = useMemo(() => placements(quality.rocks, 813).filter(p => Math.abs(p.position[0]) > 4), [quality.rocks]);
  return <group name="forest-instanced-vegetation">
    <AssetScatter id="tree_small_02" height={17} placements={trees} low tint="#a7b4a0" />
    {["a", "b", "c", "d"].map((variant, i) => <AssetScatter key={variant} id="fern_02" part={`fern_02_${variant}`} height={.52} placements={ferns.filter((_, index) => index % 4 === i)} low tint="#98ad80" />)}
    <AssetScatter id="rock_moss_set_01" part="rock_moss_set_01_rock03" width={1.6} placements={rocks} low tint="#a0afa0" />
    {([[-6, 6], [6.8, 1], [-6.5, -8], [7, -23], [-8, -29], [10, -38]] as const).map(([x, z], i) => <group key={i}>
      <GroundedAsset id="tree_small_02" height={22 + i % 3 * 3} position={[x, 0, z]} rotation={i * 1.71} castShadow={config.shadowsEnabled} low={!config.waterDetailEnabled} tint="#9fad93" />
      <GroundedAsset id="pine_roots" width={5.5} position={[x, 0, z]} rotation={i * 1.71} low tint="#909b78" burial={.1} />
    </group>)}
    <GroundedAsset id="dead_tree_trunk" width={5.5} position={[-5.5, 0, -3]} rotation={1.15} low tint="#8b967e" normalAlignment={.2} />
    <GroundedAsset id="dead_tree_trunk" width={4.2} position={[5, 0, -25]} rotation={1.9} low tint="#8b967e" normalAlignment={.2} />
    {[-1, 1].flatMap(side => [-22, -27, -32].map((z, i) => <GroundedAsset key={`${side}-${z}`} id="tree_small_02" height={8 + i * 1.6} position={[side * (4.8 + i * .4), 0, z]} rotation={i * 2.1 + side} low castShadow={config.shadowsEnabled} tint="#8f9e88" />))}
    <GroundedAsset id="pine_roots" width={2.8} position={[-3.3, 0, -3]} rotation={.6} low tint="#899578" burial={.12} />
  </group>;
}
