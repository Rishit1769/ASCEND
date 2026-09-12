import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { MeshoptDecoder } from "meshoptimizer";
import { createGroundSampler, normalizeAsset, snapToTerrain, surfaceAlignment, findDryGround, SEA_LEVEL } from "../src/components/game/grounding.ts";
import { WORLD_REGIONS, WORLD_CHECKPOINTS, resolveWorld } from "../src/lib/world.ts";
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
assert.equal(WORLD_CHECKPOINTS.length, 31);
for (const region of WORLD_REGIONS) {
  assert.equal(resolveWorld(region.levelStart).region.id, region.id);
  if (Number.isFinite(region.levelEnd)) assert.equal(resolveWorld(region.levelEnd).region.id, region.id);
}
assert.equal(resolveWorld(100).region.id, "summit");
for (const checkpoint of WORLD_REGIONS[0].checkpoints) {
  const [x,,z] = checkpoint.worldPosition;
  const hit = findDryGround(sample, x, z);
  assert(hit.point.y > SEA_LEVEL, `${checkpoint.name}: checkpoint under water`);
  assert.notEqual(hit.surface, "gravel-seabed");
  console.log(JSON.stringify({ checkpoint: checkpoint.name, position: hit.point.toArray() }));
}
for (let i = 1; i < 5; i++) {
  const first = WORLD_REGIONS[0].checkpoints[i-1].worldPosition;
  const last = WORLD_REGIONS[0].checkpoints[i].worldPosition;
  let submerged = 0;
  for (let j = 0; j <= 100; j++) {
    const t = j / 100;
    if (sample(first[0]*(1-t)+last[0]*t,first[2]*(1-t)+last[2]*t).point.y < SEA_LEVEL) submerged++;
  }
  console.log(JSON.stringify({ route: `${i}-${i+1}`, submergedSamples: submerged }));
  assert.equal(submerged, 0, `Route ${i}-${i+1} crosses water`);
}

for (const asset of [
  { id: "rock_moss_set_01", part: "rock_moss_set_01_rock05", width: 1.7, x: 3.8, z: -2, rotation: 2.3, burial: .08 },
  { id: "rock_moss_set_01", part: "rock_moss_set_01_rock03", width: 2, x: -3.7, z: .4, rotation: .8, burial: .08 },
  { id: "tree_small_02", height: 9.5, x: -8, z: -13, rotation: 1.6, burial: .012 },
  { id: "wooden_lantern_01", height: .7, x: 4.1, z: -5.6, rotation: 0, burial: .015 },
  { id: "modular_fort_01", part: "modular_fort_01_wall_thin_corner_02", height: 1.05, x: 5, z: -10, rotation: -.8, burial: .08 },
]) {
  const source = await loadGeometry(`../public/environment/${asset.id}.glb`);
  const root = new THREE.Group();
  root.add(normalizeAsset(asset.part ? source.scene.getObjectByName(asset.part) : source.scene, asset.width, asset.height));
  root.position.set(asset.x, 0, asset.z); root.rotation.y = asset.rotation;
  snapToTerrain(root, sample, { burial: asset.burial, dry: true, footprint: /rock|fort/.test(asset.id) });
  assert(root.userData.terrainContact.contactGap <= 0, `${asset.id}: floating base`);
  assert(root.userData.terrainContact.surface !== "gravel-seabed", `${asset.id}: dry prop must find land`);
  console.log(JSON.stringify({ asset: asset.part ?? asset.id, position: root.position.toArray(), ...root.userData.terrainContact }));
}

for (const clip of hero.animations) {
  const model = clone(hero.scene);
  const probes = findSoleProbes(model);
  const allBootVertices = findSoleProbes(model, true);
  assert(probes.length >= 6, "Both boot soles must have multiple probes");
  const world = new THREE.Group();
  const scaled = new THREE.Group(); scaled.scale.setScalar(1.2); scaled.rotation.y = Math.PI;
  world.add(scaled); scaled.add(model);
  const mixer = new THREE.AnimationMixer(model);
  mixer.clipAction(clip).play();
  const skeletons = new Set(probes.map(p => p.mesh.skeleton));
  const update = () => { world.updateMatrixWorld(true); skeletons.forEach(s => s.update()); };
  let groundedY = 0, minClearance = Infinity, oldMinClearance = Infinity, fullBootClearance = Infinity;
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
    if (frame % 4 === 0) fullBootClearance = Math.min(fullBootClearance, ...measureSoles(allBootVertices, sample).contacts.map(p => p.clearance));
  }
  assert(minClearance >= SOLE_OFFSET - .001, `${clip.name}: sole penetration ${minClearance}`);
  assert(fullBootClearance >= -.005, `${clip.name}: an unprobed boot vertex penetrates ${fullBootClearance}`);
  console.log(JSON.stringify({ clip: clip.name, frames, probes: probes.length, allBootVertices: allBootVertices.length, oldMinClearance, minClearance, fullBootClearance, finalRootY: groundedY }));
  for (const point of WORLD_REGIONS[0].checkpoints) {
    world.position.set(point.worldPosition[0], 0, point.worldPosition[2]);
    for (let frame = 0; frame < 120; frame++) {
      mixer.update(1 / 60); update();
      const contact = measureSoles(probes, sample);
      world.position.y += contact.correction; update();
      assert(Math.min(...measureSoles(probes, sample).contacts.map(p => p.clearance)) >= SOLE_OFFSET - .001, `${clip.name}: penetration at ${point.name}`);
    }
  }
  mixer.stopAllAction(); mixer.uncacheRoot(model);
}

const parent = new THREE.Group(); parent.scale.setScalar(2);
const prop = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1).translate(0, 4, 0));
parent.add(prop); prop.position.set(2, 12, 3); prop.scale.setScalar(1.5);
const flat = (x, z) => ({ point: new THREE.Vector3(x, 2.5, z), normal: new THREE.Vector3(0, 1, 0), surface: "test" });
snapToTerrain(prop, flat, { offset: .04, burial: .05 });
const bounds = new THREE.Box3().setFromObject(prop);
assert(Math.abs(bounds.min.y - (2.5 + .04 - 6 * .05)) < 1e-6, "Scaled off-origin prop base must be buried correctly");
parent.rotation.y = .7;
const normal = new THREE.Vector3(-.2, 1, .1).normalize();
snapToTerrain(prop, (x, z) => ({ ...flat(x, z), normal }), { normalAlignment: .2 });
const actualUp = new THREE.Vector3(0, 1, 0).applyQuaternion(prop.getWorldQuaternion(new THREE.Quaternion()));
const expectedUp = new THREE.Vector3(0, 1, 0).applyQuaternion(surfaceAlignment(normal, .2));
assert(actualUp.distanceTo(expectedUp) < 1e-6, "Normal alignment must work under rotated/scaled parents");
console.log("Grounding regression checks passed.");
