"use client";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { BoxGeometry, CylinderGeometry, MeshStandardMaterial, Object3D, InstancedMesh, TorusGeometry, IcosahedronGeometry, SphereGeometry } from "three";
import { PALETTE } from "./realmConfig";
import { useGraphicsQuality } from "../GraphicsQuality";
export type Part = { p: [number, number, number]; s: [number, number, number]; r?: [number, number, number] };
function makeResources() {
  const stone = new MeshStandardMaterial({ color: PALETTE.stone, roughness: .78 });
  stone.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 stonePoint;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nstonePoint=position;");
    shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 stonePoint;")
      .replace("#include <color_fragment>", `#include <color_fragment>
        float grain=fract(sin(dot(floor(stonePoint*340.),vec3(12.98,78.23,39.42)))*43758.54);
        float vein=sin(stonePoint.y*22.+sin(stonePoint.x*9.+stonePoint.z*13.)*2.);
        diffuseColor.rgb*=.92+grain*.08-smoothstep(.96,1.,vein)*.065;`);
  };
  return {
    geometries: { box: new BoxGeometry(1, 1, 1), column: new CylinderGeometry(.5, .5, 1, 64), cone: new CylinderGeometry(0, .5, 1, 8), ring: new TorusGeometry(1, .012, 4, 96), foliage: new IcosahedronGeometry(.5, 2), cloud: new SphereGeometry(.5, 16, 8) },
    materials: {
      stone, shade: new MeshStandardMaterial({ color: PALETTE.shade, roughness: .86 }),
      dark: new MeshStandardMaterial({ color: PALETTE.darkStone, roughness: .9 }),
      gold: new MeshStandardMaterial({ color: PALETTE.gold, roughness: .34, metalness: .82 }),
      green: new MeshStandardMaterial({ color: PALETTE.foliage, roughness: .92 }),
      flower: new MeshStandardMaterial({ color: PALETTE.flowers, roughness: .85 }),
      glow: new MeshStandardMaterial({ color: PALETTE.light, emissive: PALETTE.light, emissiveIntensity: .65, roughness: .5 }),
      cloth: new MeshStandardMaterial({ color: PALETTE.banner, roughness: .95 }),
    },
  };
}
const Resources = createContext<ReturnType<typeof makeResources> | null>(null);
export function RealmMaterials({ children }: { children: ReactNode }) {
  const resources = useMemo(() => makeResources(), []);
  useEffect(() => () => {
    Object.values(resources.geometries).forEach(g => g.dispose());
    Object.values(resources.materials).forEach(m => m.dispose());
  }, [resources]);
  return <Resources.Provider value={resources}>{children}</Resources.Provider>;
}
export function Batch({ parts, shape = "box", material = "stone", shadow = false, obstacle = false }: {
  parts: Part[]; shape?: keyof ReturnType<typeof makeResources>["geometries"];
  material?: keyof ReturnType<typeof makeResources>["materials"]; shadow?: boolean; obstacle?: boolean;
}) {
  const resources = useContext(Resources)!;
  const { config } = useGraphicsQuality();
  const ref = useRef<InstancedMesh>(null);
  useEffect(() => {
    const mesh = ref.current;
    return () => { mesh?.dispose(); };
  }, [parts.length]);
  useLayoutEffect(() => {
    const object = new Object3D();
    parts.forEach((part, i) => {
      object.position.fromArray(part.p); object.scale.fromArray(part.s);
      object.rotation.set(...(part.r ?? [0, 0, 0])); object.updateMatrix();
      ref.current!.setMatrixAt(i, object.matrix);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    ref.current!.computeBoundingSphere();
  }, [parts]);
  return <instancedMesh key={parts.length} ref={ref} args={[resources.geometries[shape], resources.materials[material], parts.length]}
    dispose={null} castShadow={shadow && config.shadowsEnabled} receiveShadow userData={{ realmObstacle: obstacle }} />;
}
