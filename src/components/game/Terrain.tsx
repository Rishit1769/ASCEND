"use client";
import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { EnvironmentAsset } from "./EnvironmentAsset";

function GroundBed() {
  const { scene } = useGLTF("/environment/coast_rocks_01.glb");
  const material = useMemo(() => {
    let source: THREE.MeshStandardMaterial | undefined;
    scene.traverse(child => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) source ??= child.material;
    });
    if (!source) throw new Error("Coastal ground material is missing");
    const result = source.clone();
    for (const key of ["map", "normalMap", "roughnessMap", "aoMap"] as const) {
      const texture = result[key]?.clone();
      if (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(6, 6);
        result[key] = texture;
      }
    }
    result.color.set("#92968a");
    return result;
  }, [scene]);
  useEffect(() => () => {
    for (const key of ["map", "normalMap", "roughnessMap", "aoMap"] as const) material[key]?.dispose();
    material.dispose();
  }, [material]);
  return (
    <mesh position={[0, -1.85, -25]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[160, 160]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function Terrain() {
  return (
    <group name="scanned-coastal-ground">
      <GroundBed />
      <EnvironmentAsset id="coast_rocks_01" width={35} ground position={[0, -1.08, 0]} />
      <EnvironmentAsset id="coast_rocks_01" low width={36} position={[0, -1.8, -22]} rotation={Math.PI} />
    </group>
  );
}
