"use client";
import { useMemo } from "react";
import { AssetScatter, GroundedAsset } from "../EnvironmentAsset";
import { useGraphicsQuality } from "../GraphicsQuality";
import { MOUNTAIN_QUALITY, mountainHeight, pathX, randomSequence } from "./mountainConfig";
import { useWorldProgress } from "../WorldProgress";

function placements(count: number, seed: number, kind: "tree" | "shrub" | "debris") {
  const random = randomSequence(seed);
  const result: { position: [number, number, number]; scale: number; rotation: number }[] = [];
  let tries = 0;
  while (result.length < count && tries < count * 18) {
    tries++;
    const z = kind === "tree" ? 25 - random() * 58 : 20 - random() * 94;
    const altitude = mountainHeight(pathX(z), z);
    if (kind === "tree" && altitude > 9.5) continue;
    if (kind === "shrub" && altitude > 15) continue;
    const side = random() > .5 ? 1 : -1;
    const distance = kind === "debris" ? 1.8 + random() * 8 : 5 + random() * 20;
    const x = pathX(z) + side * distance;
    if (Math.abs(x - pathX(z)) < (kind === "debris" ? 1.2 : 4.2)) continue;
    const y = mountainHeight(x, z);
    result.push({ position: [x, y - .06, z], scale: kind === "tree" ? .78 + random() * .9 : .45 + random() * .9, rotation: random() * Math.PI * 2 });
  }
  return result;
}

export default function MountainVegetation() {
  const { preset } = useGraphicsQuality();
  const { level } = useWorldProgress();
  const quality = MOUNTAIN_QUALITY[preset];
  const trees = useMemo(() => {
    if (level === 13) return [];
    const result = placements(quality.trees, 1211, "tree");
    return result;
  }, [quality.trees, level]);
  const shrubs = useMemo(() => {
    if (level === 13) return [];
    const result = placements(Math.floor(quality.trees * .75), 1212, "shrub");
    return result;
  }, [quality.trees, level]);
  const debris = useMemo(() => placements(quality.debris, 1213, "debris"), [quality.debris]);

  return <group name="mountain-vegetation-and-debris">
    <AssetScatter id="tree_small_02" low={preset !== "ultra" && preset !== "high"} width={preset === "potato" ? 3.6 : 4.8} placements={trees} surface castShadow={quality.shadowCasters} tint="#879889" />
    {preset !== "potato" && <AssetScatter id="fern_02" low={preset !== "ultra"} width={.95} placements={shrubs} surface tint="#667866" />}
    {debris.slice(0, Math.min(debris.length, 20)).map((item, index) => <GroundedAsset key={index} id={index % 2 ? "dead_tree_trunk" : "pine_roots"} low width={index % 2 ? 4.8 * item.scale : 2.8 * item.scale} position={item.position} rotation={item.rotation} tint="#8c8171" normalAlignment={.22} burial={.05} />)}
  </group>;
}
