"use client";
import { useEffect, useMemo } from "react";
import { ExtrudeGeometry, Shape } from "three";
import { Batch, type Part } from "./RealmMeshes";
import { PALETTE } from "./realmConfig";
export default function AscensionTemple() {
  const arch = useMemo(() => {
    const outline = new Shape();
    outline.absarc(0, 0, 4.25, 0, Math.PI, false);
    outline.lineTo(-3.15, 0);
    outline.absarc(0, 0, 3.15, Math.PI, 0, true);
    outline.closePath();
    return new ExtrudeGeometry(outline, { depth: 1.5, bevelEnabled: true, bevelSize: .06, bevelThickness: .06, bevelSegments: 2, curveSegments: 32 });
  }, []);
  useEffect(() => () => arch.dispose(), [arch]);
  const structure = useMemo(() => {
    const stone: Part[] = [], gold: Part[] = [], columns: Part[] = [];
    for (const side of [-1, 1]) {
      stone.push({ p: [side * 6.6, 12.3, -56], s: [6, 12, 9] });
      for (const z of [-51, -55, -59]) columns.push({ p: [side * 10, 12.3, z], s: [1.15, 12, 1.15] });
      for (const y of [6.6, 17.8, 19]) stone.push({ p: [side * 6.8, y, -56], s: [7.6, .55, 10] });
      gold.push({ p: [side * 6.6, 18.15, -50.93], s: [6.5, .12, .12] });
      stone.push({ p: [side * 6.6, 21.8, -56], s: [4.7, 5, 5] });
      gold.push({ p: [side * 6.6, 24.4, -56], s: [5, .24, 5] });
    }
    stone.push({ p: [0, 20.3, -57], s: [6.8, 7.5, 7] }, { p: [0, 27, -57], s: [4.5, 6, 5] });
    for (const y of [17, 24.1, 30.1]) gold.push({ p: [0, y, -57], s: [7.2 - (y - 17) * .18, .24, 7.4 - (y - 17) * .18] });
    return { stone, gold, columns };
  }, []);
  return <group name="ascension-temple">
    <mesh geometry={arch} position={[0, 12.5, -51.55]} castShadow receiveShadow userData={{ realmObstacle: true }}>
      <meshStandardMaterial color={PALETTE.stone} roughness={.72} />
    </mesh>
    <Batch parts={structure.stone} shadow obstacle />
    <Batch parts={structure.columns} shape="column" shadow obstacle />
    <Batch parts={structure.gold} material="gold" />
    <Batch material="dark" parts={[-1, 1].flatMap(side => [8.8, 13.5, 21].map(y => ({ p: [side * 6.6, y, -51.48], s: [.85, 2.1, .06] })))} />
    <Batch material="gold" parts={[-1, 1].flatMap(side => [-.58, .58].map(dx => ({ p: [side * 6.6 + dx, 12, -51.42], s: [.07, 7.8, .08] })))} />
    <Batch parts={[-1, 1].flatMap(side => [-2.4, 2.4].map(dx => ({ p: [side * 6.6 + dx, 12.3, -51.25], s: [.3, 11.3, .6] })))} />
    <Batch shape="cone" parts={[-6.6, 6.6].map(x => ({ p: [x, 26, -56], s: [6, 3, 6] }))} />
    <Batch shape="cone" material="gold" parts={[{ p: [0, 32.2, -57], s: [5.5, 4, 5.5] }]} />
    <Batch material="glow" parts={[{ p: [0, 27, -54.48], s: [.3, 4.5, .05] }]} />
    {/* Temple entrance glow plane — warm golden light */}
    <mesh position={[0, 10.8, -60.2]}>
      <planeGeometry args={[6.4, 9]} />
      <shaderMaterial transparent depthWrite={false} uniforms={{}} vertexShader="varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}"
        fragmentShader="varying vec2 v;void main(){float a=smoothstep(0.,.22,v.x)*smoothstep(0.,.22,1.-v.x);gl_FragColor=vec4(1.,.83,.49,a*.85);}" />
    </mesh>
    {/* Ascension beam — subtle vertical golden-white */}
    <mesh position={[0, 42, -57]}>
      <cylinderGeometry args={[.25, 1.1, 22, 16, 1, true]} />
      <meshBasicMaterial color={PALETTE.warmGlow} transparent opacity={.15} depthWrite={false} />
    </mesh>
    <Batch material="gold" shape="ring" parts={[{ p: [0, 17, -50], s: [1.15, 1.15, 1] }]} />
  </group>;
}
