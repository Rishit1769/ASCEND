import * as THREE from "three";
import type { GroundSampler } from "./grounding";

export const SOLE_OFFSET = .035;
export type SoleProbe = { mesh: THREE.SkinnedMesh; vertex: number; side: string };

// Find actual boot vertices weighted to foot/toe bones, rather than guessing a bone-to-sole offset.
export function findSoleProbes(root: THREE.Object3D, allBootVertices = false): SoleProbe[] {
  root.updateMatrixWorld(true);
  const candidates: Record<string, { probe: SoleProbe; point: THREE.Vector3 }[]> = { L: [], R: [] };
  root.traverse(object => {
    if (!(object instanceof THREE.SkinnedMesh)) return;
    object.skeleton.update();
    const indices = object.geometry.getAttribute("skinIndex");
    const weights = object.geometry.getAttribute("skinWeight");
    if (!indices || !weights) return;
    for (let vertex = 0; vertex < indices.count; vertex++) {
      for (let k = 0; k < 4; k++) {
        const bone = object.skeleton.bones[indices.getComponent(vertex, k)];
        const match = bone?.name.match(/([LR])[_\s]+(?:Foot|Toe)/i);
        if (!match || weights.getComponent(vertex, k) < .35) continue;
        const point = object.getVertexPosition(vertex, new THREE.Vector3()).applyMatrix4(object.matrixWorld);
        candidates[match[1].toUpperCase()].push({ probe: { mesh: object, vertex, side: match[1].toUpperCase() }, point });
        break;
      }
    }
  });
  return Object.values(candidates).flatMap(points => {
    if (!points.length) return [];
    if (allBootVertices) return points.map(p => p.probe);
    const bottom = Math.min(...points.map(p => p.point.y));
    const sole = points.filter(p => p.point.y < bottom + .045);
    const selected = new Set<typeof sole[number]>();
    for (const axis of ["x", "z"] as const) {
      sole.sort((a, b) => a.point[axis] - b.point[axis]);
      selected.add(sole[0]); selected.add(sole[sole.length - 1]);
    }
    sole.sort((a, b) => a.point.y - b.point.y);
    selected.add(sole[0]);
    return [...selected].map(p => p.probe);
  });
}

export function measureSoles(probes: SoleProbe[], sample: GroundSampler, offset = SOLE_OFFSET) {
  let correction = -Infinity;
  const contacts = probes.map(probe => {
    const point = probe.mesh.getVertexPosition(probe.vertex, new THREE.Vector3()).applyMatrix4(probe.mesh.matrixWorld);
    const hit = sample(point.x, point.z);
    const clearance = point.y - hit.point.y;
    correction = Math.max(correction, offset - clearance);
    return { side: probe.side, point: point.toArray(), groundY: hit.point.y, clearance };
  });
  return { correction: Number.isFinite(correction) ? correction : 0, contacts };
}
