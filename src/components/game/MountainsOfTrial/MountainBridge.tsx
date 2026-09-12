"use client";
import { EnvironmentAsset, GroundedAsset } from "../EnvironmentAsset";
import { useGraphicsQuality } from "../GraphicsQuality";
import { MOUNTAIN_QUALITY } from "./mountainConfig";

export default function MountainBridge() {
  const { preset } = useGraphicsQuality();
  const quality = MOUNTAIN_QUALITY[preset];
  const low = preset === "low" || preset === "potato";
  return <group name="broken-crossing-landmark" userData={{ cameraObstacle: true }}>
    <EnvironmentAsset id="modular_fort_01" part="modular_fort_01_wall_walkway_straight_01" low={low} width={3.8} position={[-1.2, 8.0, -40]} rotation={-.1} castShadow={quality.shadowCasters} tint="#aeb5b1" />
    <EnvironmentAsset id="modular_fort_01" part="modular_fort_01_wall_walkway_straight_01" low width={2.5} position={[-6.2, 7.45, -40.9]} rotation={-.28} castShadow={quality.shadowCasters} tint="#8f9694" />
    <EnvironmentAsset id="modular_fort_01" part="modular_fort_01_wall_walkway_straight_01" low width={2.4} position={[4.9, 7.25, -39.2]} rotation={.18} castShadow={quality.shadowCasters} tint="#8f9694" />
    <EnvironmentAsset id="modular_fort_01" part="modular_fort_01_tower_round" low={low} height={8.5} position={[-12, 6.3, -42]} rotation={.12} castShadow={quality.shadowCasters} tint="#9da5a2" />
    <EnvironmentAsset id="modular_fort_01" part="modular_fort_01_tower_round" low={low} height={7.8} position={[10.5, 7.1, -37.6]} rotation={-.2} castShadow={quality.shadowCasters} tint="#9da5a2" />
    <GroundedAsset id="rock_moss_set_01" low width={8.5} position={[-15, 0, -30]} rotation={.4} tint="#8f9a98" burial={.12} />
    <GroundedAsset id="rock_moss_set_01" low width={7.5} position={[14, 0, -27]} rotation={-1.2} tint="#8f9a98" burial={.12} />
    <pointLight position={[-8.6, 9.9, -41.5]} color="#e2a85f" intensity={preset === "potato" ? 0 : 3.5} distance={9} decay={2} />
    <EnvironmentAsset id="wooden_lantern_01" low height={1.2} position={[-8.6, 8.5, -41.5]} rotation={.2} tint="#d8b786" />
  </group>;
}
