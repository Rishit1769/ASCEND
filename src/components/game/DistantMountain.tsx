"use client";
import { AssetLOD, EnvironmentAsset } from "./EnvironmentAsset";
const FORT = "modular_fort_01_";
export default function DistantMountain() {
  return (
    <group name="ascension-sanctuary">
      <EnvironmentAsset id="coastal_cliff_02" low width={80} position={[-30, -4, -55]} rotation={0.25} />
      <EnvironmentAsset id="coastal_cliff_02" low width={68} position={[31, -4, -66]} rotation={-0.65} />
      <AssetLOD id="coastal_cliff_02" width={38} position={[-18, -2, -25]} rotation={0.25} />
      <AssetLOD id="coastal_cliff_02" width={32} position={[19, -2.5, -29]} rotation={-0.4} />
      <EnvironmentAsset id="coastal_cliff_02" low width={24} position={[0, -1.7, -32]} rotation={0.1} />
      <group position={[0, 1.8, -25]} scale={0.65}>
        <EnvironmentAsset id="modular_fort_01" part={FORT + "wall_thin_gate_01"} height={5.5} rotation={Math.PI / 2} />
        <EnvironmentAsset id="modular_fort_01" part={FORT + "tower_round"} height={6} position={[-5.6, -0.4, -1.6]} />
        <EnvironmentAsset id="modular_fort_01" part={FORT + "tower_round"} height={5.5} position={[5.6, -0.4, -1.6]} />
        <EnvironmentAsset id="modular_fort_01" part={FORT + "wall_thick_straight_01"} height={4} position={[-4.5, -0.4, -1]} rotation={Math.PI / 2} />
        <EnvironmentAsset id="modular_fort_01" part={FORT + "wall_thick_straight_01"} height={4} position={[4.5, -0.4, -1]} rotation={Math.PI / 2} />
        <EnvironmentAsset id="modular_fort_01" part={FORT + "wall_stairs_straight_01"} height={3.6} position={[0, -3, 3]} rotation={Math.PI} />
        <pointLight position={[0, 2, 1]} color="#9b8bc9" intensity={18} distance={9} />
        <pointLight position={[-3, 2, 1]} color="#ffb66b" intensity={14} distance={7} />
      </group>
    </group>
  );
}
