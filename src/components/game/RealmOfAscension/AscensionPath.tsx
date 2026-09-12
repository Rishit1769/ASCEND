"use client";
import { useMemo } from "react";
import { Batch, type Part } from "./RealmMeshes";
export default function AscensionPath() {
  const parts = useMemo(() => {
    const slabs: Part[] = [], trim: Part[] = [], columns: Part[] = [], caps: Part[] = [], lights: Part[] = [];
    for (let i = 0; i < 20; i++) {
      slabs.push({ p: [0, .04, 7 - i * 2], s: [6, .52, 1.98] });
      for (const x of [-2.87, 2.87]) trim.push({ p: [x, .305, 7 - i * 2], s: [.045, .014, 1.91] });
    }
    for (let i = 0; i < 24; i++) {
      const height = (i + 1) * .25;
      slabs.push({ p: [0, .3 + height / 2, -32.25 - i * .5], s: [12, height, .5] });
      trim.push({ p: [0, .305 + height, -32.02 - i * .5], s: [11.8, .012, .035] });
    }
    for (let i = 0; i < 5; i++) for (const side of [-1, 1]) {
      const x = side * 7.5, z = -i * 7;
      columns.push({ p: [x, 2.8, z], s: [.8, 5.6, .8] });
      caps.push({ p: [x, -.05, z], s: [1.7, .5, 1.7] }, { p: [x, 5.5, z], s: [1.2, .25, 1.2] });
      trim.push({ p: [x, 4.8, z], s: [.85, .12, .85] });
      lights.push({ p: [x, 5.98, z], s: [.32, .8, .32], r: [0, 0, Math.PI / 4] });
    }
    return { slabs, trim, columns, caps, lights };
  }, []);
  return <group name="arrival-path-and-staircase">
    <Batch parts={[{ p: [0, -.45, 8], s: [20, 1.5, 20] }]} shape="column" />
    <Batch parts={[{ p: [0, -3, 8], s: [19, 4, 19], r: [Math.PI, 0, 0] }]} shape="cone" material="dark" />
    <Batch parts={[{ p: [0, -1.25, -14], s: [40, 1.5, 38] }, { p: [0, 3, -56], s: [48, 6.6, 24] }]} material="shade" />
    <Batch parts={[{ p: [0, -5, -14], s: [38, 7, 36] }, { p: [0, -2, -56], s: [44, 5, 21] }]} material="dark" />
    <Batch parts={parts.slabs} />
    <Batch parts={parts.columns} shape="column" shadow obstacle />
    <Batch parts={parts.caps} shadow />
    <Batch parts={parts.trim} material="gold" />
    <Batch parts={parts.lights} material="glow" shape="column" />
    <Batch shape="ring" material="gold" parts={[4, 7.8, 9.2].map(r => ({ p: [0, .312, 8], s: [r, r, 1], r: [-Math.PI / 2, 0, 0] }))} />
    <Batch material="gold" parts={[
      { p: [-.85, .32, 8], s: [.15, .025, 3.8], r: [0, -.5, 0] },
      { p: [.85, .32, 8], s: [.15, .025, 3.8], r: [0, .5, 0] },
      { p: [0, .32, 8.7], s: [1.7, .025, .12] },
    ]} />
    <Batch parts={[-1, 1].flatMap(side => [
      { p: [side * 6.5, 3.65, -38], s: [.65, 1, 13.5], r: [Math.atan(.5), 0, 0] } as Part,
      { p: [side * 19.6, -.1, -14], s: [.6, .8, 38] } as Part,
    ])} />
  </group>;
}
