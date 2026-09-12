"use client";
import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { createForestGeometry, FOREST_QUALITY } from "./forestConfig";
import { useThree } from "@react-three/fiber";
export { createForestGeometry } from "./forestConfig";
import { useGraphicsQuality } from "../GraphicsQuality";

export default function ForestTerrain() {
  const { config, preset } = useGraphicsQuality();
  const gl = useThree(state => state.gl);
  const sources = useTexture(["/environment/forest-floor-Diffuse.jpg", "/environment/forest-floor-nor_gl.jpg", "/environment/forest-floor-Rough.jpg"]);
  const maps = useMemo(() => sources.map((source, i) => {
    const map = source.clone();
    map.colorSpace = i === 0 ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(34, 44);
    map.anisotropy = Math.min(FOREST_QUALITY[preset].anisotropy, gl.capabilities.getMaxAnisotropy());
    map.needsUpdate = true;
    return map;
  }), [sources, preset, gl]);
  const geometry = useMemo(() => createForestGeometry(), []);
  useEffect(() => () => { maps.forEach(map => map.dispose()); }, [maps]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} receiveShadow name="forest-collision-ground">
    <meshStandardMaterial color="#9ba58d" map={maps[0]} normalMap={config.waterDetailEnabled ? maps[1] : undefined} roughnessMap={maps[2]} roughness={.92}
      onBeforeCompile={shader => {
        shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 forestPoint;")
          .replace("#include <begin_vertex>", "#include <begin_vertex>\nforestPoint=position;");
        shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 forestPoint;")
          .replace("#include <color_fragment>", `#include <color_fragment>
            float trail=1.-smoothstep(.65,2.8,abs(forestPoint.x-sin(forestPoint.z*.19)*1.65));
            float mossPatch=sin(forestPoint.x*.74+sin(forestPoint.z*.63))*sin(forestPoint.z*.51)*.5+.5;
            float wet=1.-smoothstep(-.48,.4,forestPoint.y);
            diffuseColor.rgb=mix(diffuseColor.rgb, diffuseColor.rgb*vec3(.48,.68,.39),mossPatch*(1.-trail)*.65);
            diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.085,.067,.042)+diffuseColor.rgb*.38,trail*.65);
            diffuseColor.rgb*=1.-wet*.35;`)
          .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>\nroughnessFactor=mix(max(.78,roughnessFactor),${config.waterDetailEnabled ? ".48" : ".68"},wet);`);
      }} />
  </mesh>;
}
