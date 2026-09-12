"use client";
import { useMemo } from "react";
import { Batch, type Part } from "./RealmMeshes";
import { REALM_QUALITY, PALETTE } from "./realmConfig";
import { useGraphicsQuality } from "../GraphicsQuality";
export default function AscensionGardens() {
  const { preset } = useGraphicsQuality();
  const count = REALM_QUALITY[preset].plants;
  const parts = useMemo(() => {
    const trees: Part[] = [], trunks: Part[] = [], planters: Part[] = [], shrubs: Part[] = [], flowers: Part[] = [], benches: Part[] = [], cloth: Part[] = [], gold: Part[] = [];
    for (const side of [-1, 1]) {
      for (const z of [-48, -61]) {
        trees.push({ p: [side * 18, 10.8, z], s: [2.6, 7, 2.6] });
        trunks.push({ p: [side * 18, 7.2, z], s: [.35, 1.8, .35] });
        planters.push({ p: [side * 18, 6.55, z], s: [4.2, .5, 4.2] });
      }
      benches.push({ p: [side * 15, 7, -55], s: [3, .3, 1] });
      for (const dx of [-1, 1]) benches.push({ p: [side * 15 + dx, 6.6, -55], s: [.25, .6, .75] });
      planters.push({ p: [side * 10, -.2, -30], s: [5, .6, 3] });
      for (const z of [3, -18, -49]) {
        const floor = z < -40 ? 6.3 : -.5;
        cloth.push({ p: [side * 10.5, floor + 4, z], s: [1.35, 2.8, .035] });
        gold.push({ p: [side * 11.3, floor + 2.6, z], s: [.08, 5.8, .08] }, { p: [side * 10.5, floor + 5.5, z], s: [1.9, .08, .08] },
          { p: [side * 10.5, floor + 3, z + .03], s: [1.3, .055, .04] });
        for (const dx of [-.25, .25]) gold.push({ p: [side * 10.5 + dx, floor + 4, z + .04], s: [.07, 1.2, .04], r: [0, 0, dx < 0 ? -.45 : .45] });
      }
    }
    for (let i = 0; i < count; i++) {
      const side = i % 2 ? -1 : 1, t = (i * .618033) % 1, v = (i * .414213) % 1;
      const upper = i % 3 !== 0, x = side * (upper ? 13 + t * 9 : 8 + t * 5), z = upper ? -46 - v * 18 : -29 - v * 2;
      const y = upper ? 6.3 : .1;
      shrubs.push({ p: [x, y + .3, z], s: [.7, .65, .7] });
      flowers.push({ p: [x + .1, y + .66, z], s: [.17, .11, .17] });
    }
    return { trees, trunks, planters, shrubs, flowers, benches, cloth, gold };
  }, [count]);
  return <group name="ascension-gardens-and-banners">
    {[-1, 1].map(side => <mesh key={side} rotation-x={-Math.PI / 2} position={[side * 15, 6.32, -59]}>
      <circleGeometry args={[1.8, 32]} />
      <meshStandardMaterial color={PALETTE.water} roughness={.26} metalness={.15} />
    </mesh>)}
    <Batch parts={parts.trees} shape="foliage" material="green" shadow />
    <Batch parts={parts.trunks} material="dark" shape="column" />
    <Batch parts={parts.planters} material="dark" />
    <Batch parts={parts.shrubs} material="green" shape="foliage" />
    <Batch parts={parts.flowers} material="flower" shape="column" />
    <Batch parts={parts.benches} />
    <Batch parts={parts.cloth} material="cloth" />
    <Batch parts={parts.gold} material="gold" />
  </group>;
}
