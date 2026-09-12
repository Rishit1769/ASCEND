import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { MeshoptDecoder } from "meshoptimizer";
import { createGroundSampler, normalizeAsset, snapToTerrain } from "../src/components/game/grounding.ts";
import { findSoleProbes, measureSoles, SOLE_OFFSET } from "../src/components/game/heroGrounding.ts";

// Keep real geometry, skins and clips, but omit images for a headless geometry-only test.
async function loadGeometry(path) {
  const bytes = await readFile(new URL(path, import.meta.url));
  const length = bytes.readUInt32LE(12);
  const json = JSON.parse(bytes.subarray(20, 20 + length));
  delete json.images; delete json.textures; delete json.materials;
  for (const mesh of json.meshes) for (const primitive of mesh.primitives) delete primitive.material;
  const encoded = Buffer.from(JSON.stringify(json));
  const padded = Buffer.alloc(Math.ceil(encoded.length / 4) * 4, 32);
  encoded.copy(padded);
  const bin = bytes.subarray(20 + length);
  const output = Buffer.alloc(20 + padded.length + bin.length);
  output.writeUInt32LE(0x46546c67, 0); output.writeUInt32LE(2, 4); output.writeUInt32LE(output.length, 8);
  output.writeUInt32LE(padded.length, 12); output.writeUInt32LE(0x4e4f534a, 16);
  padded.copy(output, 20); bin.copy(output, 20 + padded.length);
  return new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength), "");
}

const hero = await loadGeometry("../public/models/armored_king.glb");
const near = await loadGeometry("../public/environment/coast_rocks_01.glb");
const far = await loadGeometry("../public/environment/coast_rocks_01-lod.glb");
const a = normalizeAsset(near.scene, 35, undefined, true);
a.position.set(0, -1.08, 0);
const b = normalizeAsset(far.scene, 36);
b.position.set(0, -1.8, -22); b.rotation.y = Math.PI;
const sample = createGroundSampler([a, b]);
assert(Math.abs(sample(0, 0).point.y + 1.08) < .001);

for (const clip of hero.animations) {
  const model = clone(hero.scene);
  const probes = findSoleProbes(model);
  assert(probes.length >= 6, "Both boot soles must have multiple probes");
  const world = new THREE.Group();
  const scaled = new THREE.Group(); scaled.scale.setScalar(1.2); scaled.rotation.y = Math.PI;
  world.add(scaled); scaled.add(model);
  const mixer = new THREE.AnimationMixer(model);
  mixer.clipAction(clip).play();
  const skeletons = new Set(probes.map(p => p.mesh.skeleton));
  const update = () => { world.updateMatrixWorld(true); skeletons.forEach(s => s.update()); };
  let groundedY = 0, minClearance = Infinity, oldMinClearance = Infinity;
  const frames = Math.ceil(clip.duration * 60) * 2;
  for (let frame = 0; frame < frames; frame++) {
    mixer.update(1 / 60);
    world.position.y = -.1; update();
    oldMinClearance = Math.min(oldMinClearance, ...measureSoles(probes, sample).contacts.map(p => p.clearance));
    world.position.y = groundedY; update();
    const { correction } = measureSoles(probes, sample);
    groundedY += correction > 0 ? correction : correction * (1 - Math.exp(-18 / 60));
    world.position.y = groundedY; update();
    minClearance = Math.min(minClearance, ...measureSoles(probes, sample).contacts.map(p => p.clearance));
  }
  assert(minClearance >= SOLE_OFFSET - .001, `${clip.name}: sole penetration ${minClearance}`);
  console.log(JSON.stringify({ clip: clip.name, frames, probes: probes.length, oldMinClearance, minClearance, finalRootY: groundedY }));
  mixer.stopAllAction(); mixer.uncacheRoot(model);
}

const parent = new THREE.Group(); parent.scale.setScalar(2);
const prop = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1).translate(0, 4, 0));
parent.add(prop); prop.position.set(2, 12, 3); prop.scale.setScalar(1.5);
const flat = (x, z) => ({ point: new THREE.Vector3(x, 2.5, z), normal: new THREE.Vector3(0, 1, 0), surface: "test" });
snapToTerrain(prop, flat, { offset: .04, burial: .05 });
const bounds = new THREE.Box3().setFromObject(prop);
assert(Math.abs(bounds.min.y - (2.5 + .04 - 6 * .05)) < 1e-6, "Scaled off-origin prop base must be buried correctly");
console.log("Grounding regression checks passed.");
