"use client";
import { EnvironmentAsset, GroundedAsset } from "../EnvironmentAsset";
import { useGraphicsQuality } from "../GraphicsQuality";

export default function ForestRuins() {
  const { config } = useGraphicsQuality();
  return <group name="forest-guardian-sanctuary">
    <GroundedAsset id="coastal_cliff_02" width={65} position={[0, 0, -71]} rotation={Math.PI} low tint="#788c82" />
    <GroundedAsset id="modular_fort_01" part="modular_fort_01_wall_thin_gate_01" height={10} rotation={Math.PI / 2} position={[0, 0, -53]} castShadow low tint="#89998a" />
    {[-1, 1].map(side => <group key={side}>
      <GroundedAsset id="modular_fort_01" part="modular_fort_01_tower_round" height={10.5} position={[side * 10, 0, -54]} castShadow low tint="#849589" />
      <GroundedAsset id="coastal_cliff_02" width={39} position={[side * 28, 0, -59]} rotation={side * .4} low castShadow tint="#819187" />
      <GroundedAsset id="modular_fort_01" part="modular_fort_01_wall_thin_straight_03" height={3.2} position={[side * 5, 0, -27]} rotation={side * .3} low tint="#95a18a" />
    </group>)}
    <GroundedAsset id="modular_fort_01" part="modular_fort_01_wall_thin_gate_01" height={4.5} position={[6, 0, -12]} rotation={Math.PI / 2} low tint="#a7a88d" />
    {([[-2.5, -14], [2.5, -22], [4.5, -11], [-5, -37], [5, -37]] as const).map(([x, z], i) => <GroundedAsset key={i} id="wooden_lantern_01" height={.8} position={[x, 0, z]} low>
      {config.waterDetailEnabled && <pointLight position={[0, .65, 0]} color="#ffc16d" intensity={5} distance={5} decay={2} />}
    </GroundedAsset>)}
    <EnvironmentAsset id="rock_moss_set_01" width={9} position={[13, -.65, -43]} low tint="#7d9a83" />
  </group>;
}
