"use client";
import { RealmMaterials } from "./RealmMeshes";
import AscensionPath from "./AscensionPath";
import AscensionTemple from "./AscensionTemple";
import AscensionGardens from "./AscensionGardens";
import AscensionWater from "./AscensionWater";
import FloatingIslands from "./FloatingIslands";
import RealmCameraGuard from "./RealmCameraGuard";
export default function RealmOfAscension() {
  return <RealmMaterials><group name="realm-of-ascension-environment">
    <AscensionPath /><AscensionTemple /><AscensionGardens />
    <AscensionWater /><FloatingIslands /><RealmCameraGuard />
  </group></RealmMaterials>;
}
