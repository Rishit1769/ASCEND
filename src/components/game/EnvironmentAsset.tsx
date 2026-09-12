"use client";

import { Component, type ReactNode, useLayoutEffect, useMemo, useRef } from "react";
import { Detailed, useGLTF } from "@react-three/drei";
import * as THREE from "three";

type Placement = { position: [number, number, number]; scale?: number; rotation?: number };
interface AssetProps {
  id: string;
  part?: string;
  width?: number;
  height?: number;
  position?: [number, number, number];
  rotation?: number;
  low?: boolean;
  ground?: boolean;
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
function AssetRoot({ id, part, width, height, low, ground }: AssetProps) {
  const url = "/environment/" + id + (low ? "-lod" : "") + ".glb";
  const { scene } = useGLTF(url);

  const model = useMemo(() => {
    const source = part ? scene.getObjectByName(part) : scene;
    if (!source) return null;
    const clone = source.clone(true);
    const root = new THREE.Group();
    root.add(clone);
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const factor = height ? height / size.y : (width ?? size.x) / size.x;
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(new THREE.Vector3(center.x, box.min.y, center.z));
    root.scale.setScalar(factor);
    root.updateMatrixWorld(true);
    if (ground) {
      const ray = new THREE.Raycaster(new THREE.Vector3(0, 100, 0), new THREE.Vector3(0, -1, 0));
      const hit = ray.intersectObject(root, true)[0];
      if (hit) clone.position.y -= hit.point.y / factor;
    }
    root.traverse(child => {
      if (child instanceof THREE.Mesh) child.receiveShadow = true;
    });
    root.updateMatrixWorld(true);
    return root;
  }, [scene, part, width, height, ground]);

  if (!model) return null;
  return <primitive object={model} dispose={null} />;
}

/* ─── Inner: loads GLB and extracts meshes for instancing ───────── */
function ScatterRoot({ id, part, low, placements }: AssetProps & { placements: Placement[] }) {
  const url = "/environment/" + id + (low ? "-lod" : "") + ".glb";
  const { scene } = useGLTF(url);

  const meshes = useMemo(() => {
    const source = part ? scene.getObjectByName(part) : scene;
    if (!source) return [];
    const result: THREE.Mesh[] = [];
    source.traverse(child => { if (child instanceof THREE.Mesh) result.push(child); });
    return result;
  }, [scene, part]);

  return <>{meshes.map(mesh => <MeshInstances key={mesh.uuid} mesh={mesh} placements={placements} />)}</>;
}

function MeshInstances({ mesh, placements }: { mesh: THREE.Mesh; placements: Placement[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const transform = new THREE.Object3D();
    const matrix = new THREE.Matrix4();
    placements.forEach((placement, index) => {
      transform.position.fromArray(placement.position);
      transform.rotation.set(0, placement.rotation ?? 0, 0);
      transform.scale.setScalar(placement.scale ?? 1);
      transform.updateMatrix();
      matrix.multiplyMatrices(transform.matrix, mesh.matrixWorld);
      ref.current!.setMatrixAt(index, matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [mesh, placements]);
  return <instancedMesh ref={ref} args={[mesh.geometry, mesh.material, placements.length]} receiveShadow dispose={null} />;
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
