"use client";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { EnvironmentAsset } from "./EnvironmentAsset";

function GroundBed() {
  const material = useMemo(() => {
    // The scan uses an atlas, not a tileable material. Exposed seams need their own gravel bed.
    const result = new THREE.MeshStandardMaterial({ color: "#41433e", roughness: .96, metalness: 0 });
    result.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 groundPosition;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\ngroundPosition=(modelMatrix*vec4(position,1.)).xyz;");
      shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>
        varying vec3 groundPosition;
        float grain(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        float mineral(vec2 p) { vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(grain(i),grain(i+vec2(1,0)),f.x),mix(grain(i+vec2(0,1)),grain(i+vec2(1,1)),f.x),f.y); }`)
        .replace("#include <color_fragment>", `#include <color_fragment>
          float coarse = mineral(groundPosition.xz*.8);
          float grit = mineral(groundPosition.xz*85.);
          diffuseColor.rgb *= mix(vec3(.58,.65,.61),vec3(1.03,1.0,.92),coarse) * (.76+grit*.35);
          float path = 1.-smoothstep(.6,2.,abs(groundPosition.x-sin(groundPosition.z*.23)*.65));
          diffuseColor.rgb *= 1.+path*.12;`);
    };
    return result;
  }, []);
  useEffect(() => () => material.dispose(), [material]);
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
