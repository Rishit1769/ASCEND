import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, weld, simplify, textureCompress, meshopt, getBounds } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

await Promise.all([MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
const targets = { coastal_cliff_02: 70000, coast_rocks_01: 45000, modular_fort_01: 100000, fern_02: 6000, tree_small_02: 18000, rock_moss_set_01: 18000, wooden_lantern_01: 6000 };
const report = JSON.parse(await readFile("public/environment/manifest.json", "utf8").catch(() => "{}"));
function triangles(doc) {
  return doc.getRoot().listMeshes().reduce((sum, mesh) => sum + mesh.listPrimitives().reduce((n, p) => n + (p.getIndices()?.getCount() ?? p.getAttribute("POSITION").getCount()) / 3, 0), 0);
}
for (const [id, target] of Object.entries(targets)) {
  if (process.argv[2] && !process.argv.slice(2).includes(id)) continue;
  const doc = await io.read(".asset-cache/environment/" + id + "/model.gltf");
  // Poly Haven ARM maps contain AO in red; their source glTF only binds G/B.
  if (id !== "wooden_lantern_01") {
    for (const material of doc.getRoot().listMaterials()) {
      material.setOcclusionTexture(material.getMetallicRoughnessTexture()).setOcclusionStrength(0.65);
    }
  }
  const before = triangles(doc);
  await doc.transform(dedup(), weld(), simplify({ simplifier: MeshoptSimplifier, ratio: Math.min(1, target / before), error: 0.005 }));
  const high = triangles(doc);
  const bounds = getBounds(doc.getRoot().listScenes()[0]);
  const resolution = id === "wooden_lantern_01" ? 512 : ["modular_fort_01", "fern_02", "tree_small_02"].includes(id) ? 1024 : 2048;
  await doc.transform(textureCompress({ encoder: sharp, targetFormat: "webp", resize: [resolution, resolution], quality: 88 }));
  const maps = doc.getRoot().listTextures().map(t => ({ name: t.getName(), size: t.getSize(), mimeType: t.getMimeType() }));
  // Generate the far version before mesh quantization, preserving the detailed source silhouette.
  const low = await io.readBinary(await io.writeBinary(doc));
  await low.transform(simplify({ simplifier: MeshoptSimplifier, ratio: 0.25, error: 0.01 }), textureCompress({ encoder: sharp, targetFormat: "webp", resize: [1024, 1024], quality: 80 }));
  const lowCount = triangles(low);
  await doc.transform(meshopt({ encoder: MeshoptEncoder, level: "high" }));
  await low.transform(meshopt({ encoder: MeshoptEncoder, level: "high" }));
  await io.write("public/environment/" + id + ".glb", doc);
  await io.write("public/environment/" + id + "-lod.glb", low);
  report[id] = { source: "https://polyhaven.com/a/" + id, license: "CC0-1.0", sourceTriangles: before, highTriangles: high, lowTriangles: lowCount, bounds, maps };
  console.log(id, JSON.stringify(report[id]));
  await writeFile("public/environment/manifest.json", JSON.stringify(report, null, 2));
}
await writeFile("public/environment/manifest.json", JSON.stringify(report, null, 2));
