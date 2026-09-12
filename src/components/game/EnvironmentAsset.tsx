"use client";

import { Component, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Detailed, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { normalizeAsset, useTerrainSurface } from "./terrainSurface";
import { findDryGround, snapToTerrain, surfaceAlignment } from "./grounding";
import { useReducedMotion } from "./useReducedMotion";

type Placement = { position: [number, number, number]; scale?: number; rotation?: number; normal?: THREE.Vector3 };
interface AssetProps {
  id: string;
  part?: string;
  width?: number;
  height?: number;
  position?: [number, number, number];
  rotation?: number;
  low?: boolean;
  ground?: boolean;
  castShadow?: boolean;
  tint?: string;
  surface?: boolean;
  burial?: number;
  offset?: number;
  normalAlignment?: number;
  children?: ReactNode;
}

function useArtMaterial(id: string, tint = "#ffffff") {
  const gl = useThree(state => state.gl);
  const reduced = useReducedMotion();
  const wind = useRef({ value: 0 });
  useFrame((_, delta) => { if (!reduced) wind.current.value += Math.min(delta, .05); });
  return useMemo(() => (source: THREE.Material) => {
    const material = source.clone();
    if (!(material instanceof THREE.MeshStandardMaterial)) return material;
    material.color.multiply(new THREE.Color(tint));
    for (const key of ["map", "emissiveMap"] as const) if (material[key]) material[key]!.colorSpace = THREE.SRGBColorSpace;
    for (const key of ["normalMap", "roughnessMap", "metalnessMap", "aoMap"] as const) if (material[key]) material[key]!.colorSpace = THREE.NoColorSpace;
    if (material.aoMap && material.roughnessMap) {
      material.roughnessMap.updateMatrix();
      material.aoMap.channel = material.roughnessMap.channel;
      material.aoMap.matrix.copy(material.roughnessMap.matrix);
      material.aoMap.matrixAutoUpdate = false;
      material.aoMap.needsUpdate = true;
    }
    if (material instanceof THREE.MeshPhysicalMaterial) {
      const maximum = Math.max(material.specularColor.r, material.specularColor.g, material.specularColor.b, 1);
      material.specularColor.multiplyScalar(1 / maximum);
    }
    const foliage = /leaves|fern/.test(material.name);
    if (foliage) {
      material.side = THREE.DoubleSide;
      material.transparent = false;
      material.alphaTest = .45;
      material.alphaToCoverage = true;
      material.depthWrite = true;
      material.roughness = .9;
      material.onBeforeCompile = shader => {
        shader.uniforms.shoreWind = wind.current;
        shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nuniform float shoreWind;")
          .replace("#include <begin_vertex>", `#include <begin_vertex>
            transformed.x += sin(shoreWind*.7 + position.y*5. + position.z*4.) * .0025 * smoothstep(-.8,.7,position.y);`);
        shader.fragmentShader = shader.fragmentShader.replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\nreflectedLight.indirectDiffuse *= gl_FrontFacing ? 1.0 : 1.18;");
      };
      material.customProgramCacheKey = () => "shore-foliage-v1";
    }
    const stone = /cliff|rocks|rock_moss|fort/.test(id);
    if (stone) {
      material.metalness = 0;
      material.normalScale.multiplyScalar(1.18);
      material.aoMapIntensity = 0.8;
      for (const key of ["map", "normalMap", "roughnessMap", "aoMap"] as const) {
        const texture = material[key];
        if (texture) {
          texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
          texture.needsUpdate = true;
        }
      }
      material.onBeforeCompile = shader => {
        shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 artPosition;")
          .replace("#include <worldpos_vertex>", `#include <worldpos_vertex>
            vec4 artLocal = vec4(transformed, 1.0);
            #ifdef USE_INSTANCING
              artLocal = instanceMatrix * artLocal;
            #endif
            artPosition = (modelMatrix * artLocal).xyz;`);
        shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 artPosition;")
          .replace("#include <color_fragment>", `#include <color_fragment>
            float weather = sin(artPosition.x * .73 + sin(artPosition.z * .51)) * sin(artPosition.z * .31 + artPosition.y);
            diffuseColor.rgb *= mix(vec3(.82, .86, .83), vec3(1.04, 1.01, .96), weather * .5 + .5);
            float damp=(1.-smoothstep(-1.68,-1.30,artPosition.y))*smoothstep(-.4,.6,weather);
            diffuseColor.rgb *= 1.-damp*.25;
            ${id === "coast_rocks_01" ? `
              float pathCenter = sin(artPosition.z * .23) * .65;
              float path = (1.-smoothstep(.55, 1.8, abs(artPosition.x-pathCenter) + weather*.2)) * smoothstep(-26.,-22.,artPosition.z);
              float stoneLuma = dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
              diffuseColor.rgb = mix(diffuseColor.rgb, vec3(stoneLuma)*vec3(1.24,1.16,1.0)+vec3(.018,.014,.008),path*.65);
            ` : ""}`)
          .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
            roughnessFactor = mix(max(roughnessFactor,.86),max(.28,roughnessFactor*.5),damp);`);
      };
      material.customProgramCacheKey = () => "shore-weathering-v3-" + id;
    }
    return material;
  }, [gl, id, tint]);
}

/* ─── Error boundary — silences missing-GLB crashes ────────────── */
interface EBState { hasError: boolean }
class AssetErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError(): EBState { return { hasError: true }; }
  componentDidCatch(err: Error) {
    console.warn("[ASCEND] Environment asset skipped:", err.message);
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

/* ─── Inner: loads a single GLB via useGLTF ────────────────────── */
function AssetRoot({ id, part, width, height, low, ground, castShadow, tint }: AssetProps) {
  const url = "/environment/" + id + (low ? "-lod" : "") + ".glb";
  const { scene } = useGLTF(url);
  const artMaterial = useArtMaterial(id, tint);

  const model = useMemo(() => {
    const source = part ? scene.getObjectByName(part) : scene;
    if (!source) return null;
    const root = normalizeAsset(source, width, height, ground);
    const materials = new Map<THREE.Material, THREE.Material>();
    root.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.receiveShadow = true;
        child.castShadow = !!castShadow;
        const convert = (m: THREE.Material) => {
          if (!materials.has(m)) materials.set(m, artMaterial(m));
          return materials.get(m)!;
        };
        child.material = Array.isArray(child.material) ? child.material.map(convert) : convert(child.material);
      }
    });
    root.updateMatrixWorld(true);
    return root;
  }, [scene, part, width, height, ground, castShadow, artMaterial]);
  useEffect(() => () => {
    const materials = new Set<THREE.Material>();
    model?.traverse(child => {
      if (child instanceof THREE.Mesh) (Array.isArray(child.material) ? child.material : [child.material]).forEach(m => materials.add(m));
    });
    materials.forEach(m => m.dispose());
  }, [model]);

  if (!model) return null;
  return <primitive object={model} dispose={null} />;
}

/* ─── Inner: loads GLB and extracts meshes for instancing ───────── */
function ScatterRoot({ id, part, low, placements, width, height, surface, castShadow, tint }: AssetProps & { placements: Placement[] }) {
  const url = "/environment/" + id + (low ? "-lod" : "") + ".glb";
  const { scene } = useGLTF(url);
  const terrain = useTerrainSurface();
  const adjusted = useMemo(() => placements.map(p => {
    if (!surface) return p;
    const hit = findDryGround(terrain, p.position[0], p.position[2]);
    return { ...p, position: [hit.point.x, hit.point.y - .04, hit.point.z] as [number, number, number], normal: hit.normal };
  }), [placements, surface, terrain]);

  const meshes = useMemo(() => {
    const source = part ? scene.getObjectByName(part) : scene;
    if (!source) return [];
    const result: THREE.Mesh[] = [];
    normalizeAsset(source, width, height).traverse(child => { if (child instanceof THREE.Mesh) result.push(child); });
    return result;
  }, [scene, part, width, height]);

  return <>{meshes.map(mesh => <MeshInstances key={mesh.uuid} id={id} tint={tint} castShadow={castShadow} mesh={mesh} placements={adjusted} />)}</>;
}

function MeshInstances({ mesh, placements, id, castShadow, tint }: { mesh: THREE.Mesh; placements: Placement[]; id: string; castShadow?: boolean; tint?: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const convert = useArtMaterial(id, tint);
  const material = useMemo(() => Array.isArray(mesh.material) ? mesh.material.map(convert) : convert(mesh.material), [mesh.material, convert]);
  useEffect(() => () => (Array.isArray(material) ? material : [material]).forEach(m => m.dispose()), [material]);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const transform = new THREE.Object3D();
    const matrix = new THREE.Matrix4();
    placements.forEach((placement, index) => {
      transform.position.fromArray(placement.position);
      transform.rotation.set(0, placement.rotation ?? 0, 0);
      if (placement.normal) transform.quaternion.premultiply(surfaceAlignment(placement.normal, .2));
      transform.scale.setScalar(placement.scale ?? 1);
      transform.updateMatrix();
      matrix.multiplyMatrices(transform.matrix, mesh.matrixWorld);
      ref.current!.setMatrixAt(index, matrix);
      ref.current!.setColorAt(index, new THREE.Color().setRGB(0.90 + (index % 4) * .025, 0.94 + (index % 3) * .02, 0.88 + (index % 5) * .025));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [mesh, placements]);
  return <instancedMesh ref={ref} args={[mesh.geometry, material, placements.length]} castShadow={castShadow} receiveShadow dispose={null} />;
}

/* ─── Public exports — each wrapped in error boundary ───────────── */

export function EnvironmentAsset(props: AssetProps) {
  return (
    <AssetErrorBoundary fallback={null}>
      <group position={props.position} rotation={[0, props.rotation ?? 0, 0]}>
        <AssetRoot {...props} />
      </group>
    </AssetErrorBoundary>
  );
}

function GroundedRoot({ position, rotation, burial = .035, offset = 0, normalAlignment = 0, children, ...props }: AssetProps) {
  const group = useRef<THREE.Group>(null);
  const terrain = useTerrainSurface();
  // Resolve loading here so bounds are available when the placement effect runs.
  useGLTF("/environment/" + props.id + (props.low ? "-lod" : "") + ".glb");
  useLayoutEffect(() => {
    if (!group.current) return;
    group.current.position.fromArray(position ?? [0, 0, 0]);
    group.current.rotation.set(0, rotation ?? 0, 0);
    snapToTerrain(group.current, terrain, { offset, burial, normalAlignment, dry: true, footprint: /rock|fort/.test(props.id) });
  }, [position, rotation, burial, offset, normalAlignment, terrain, props.id, props.part, props.width, props.height, props.low]);
  return <group ref={group}><AssetRoot {...props} />{children}</group>;
}

export function GroundedAsset(props: AssetProps) {
  return <AssetErrorBoundary fallback={null}><GroundedRoot {...props} /></AssetErrorBoundary>;
}

export function AssetLOD(props: AssetProps) {
  return (
    <AssetErrorBoundary fallback={null}>
      <Detailed distances={[0, 28]} hysteresis={0.12} position={props.position} rotation={[0, props.rotation ?? 0, 0]}>
        <AssetRoot {...props} position={[0, 0, 0]} rotation={0} />
        <AssetRoot {...props} position={[0, 0, 0]} rotation={0} low />
      </Detailed>
    </AssetErrorBoundary>
  );
}

export function AssetScatter({ placements, ...props }: AssetProps & { placements: Placement[] }) {
  return (
    <AssetErrorBoundary fallback={null}>
      <group>
        <ScatterRoot {...props} placements={placements} />
      </group>
    </AssetErrorBoundary>
  );
}
