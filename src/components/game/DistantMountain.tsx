"use client";
import { AssetLOD, EnvironmentAsset } from "./EnvironmentAsset";
const FORT = "modular_fort_01_";
export default function DistantMountain() {
  return (
    <group name="ascension-sanctuary">
      <EnvironmentAsset id="coastal_cliff_02" low width={80} position={[-36, -5, -72]} rotation={.4} tint="#afc0cb" />
      <EnvironmentAsset id="coastal_cliff_02" low width={68} position={[38, -6, -89]} rotation={-.65} tint="#b0c1ce" />
      <AssetLOD id="coastal_cliff_02" width={38} position={[-23, -3, -36]} rotation={.25} tint="#c7cecc" />
      <AssetLOD id="coastal_cliff_02" width={32} position={[23, -4, -44]} rotation={-.4} />
      <EnvironmentAsset id="coastal_cliff_02" low width={24} position={[0, -3, -27.5]} rotation={.1} />
      <group position={[0, 1.2, -25]} scale={.65}>
        <EnvironmentAsset id="modular_fort_01" part={FORT + "wall_thin_gate_01"} height={5.5} rotation={Math.PI / 2} castShadow />
        <EnvironmentAsset id="modular_fort_01" part={FORT + "tower_round"} height={8.7} position={[-4.8, -.9, -3.9]} castShadow />
        <EnvironmentAsset id="modular_fort_01" part={FORT + "tower_round"} height={4.1} position={[5.1, -.6, -2.6]} />
        <EnvironmentAsset id="modular_fort_01" part={FORT + "wall_thick_straight_01"} height={3.5} position={[-3.8, -.8, -1.8]} rotation={Math.PI / 2} />
        <EnvironmentAsset id="modular_fort_01" part={FORT + "wall_thin_corner_03"} height={2.7} position={[3.7, -.7, -.9]} rotation={1.3} />
        <EnvironmentAsset id="modular_fort_01" part={FORT + "wall_stairs_straight_01"} height={3.3} position={[0, -2.8, 3]} rotation={Math.PI} castShadow />
        <pointLight position={[0, 2, 1.5]} color="#b49cdf" intensity={5} distance={6} />
        <pointLight position={[-1.6, 1.3, 1.3]} color="#ffbd70" intensity={3.5} distance={7} />
      </group>
      {/* Rock shoulders interrupt the masonry base and conceal the straight kit edges. */}
      <EnvironmentAsset id="modular_fort_01" part={FORT + "wall_thick_straight_02"} height={2.5} position={[-2.5, -1.45, -25.8]} rotation={Math.PI / 2} />
      <EnvironmentAsset id="coastal_cliff_02" low width={10} position={[-5.6, -1.5, -25.8]} rotation={.6} tint="#c2c6ba" />
      <EnvironmentAsset id="coastal_cliff_02" low width={8} position={[5, -1.6, -26]} rotation={-.4} />
      <EnvironmentAsset id="rock_moss_set_01" part="rock_moss_set_01_rock04" width={5.2} position={[-3.8, -2.6, -25.2]} rotation={.7} />
      <EnvironmentAsset id="rock_moss_set_01" part="rock_moss_set_01_rock05" width={5.6} position={[3.8, -2.4, -25.9]} rotation={2.4} />
      <EnvironmentAsset id="tree_small_02" low height={4.5} position={[-6.2, .8, -29]} rotation={1.4} />
      <EnvironmentAsset id="fern_02" part="fern_02_b" height={.9} position={[2.8, -.2, -24.5]} />
    </group>
  );
}
