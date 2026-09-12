// Asset downloads only; the application uses local files and never calls this API.
// Powered by Poly Haven: https://polyhaven.com (assets licensed CC0).
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const assets = ["coastal_cliff_02", "coast_rocks_01", "modular_fort_01", "fern_02", "tree_small_02", "rock_moss_set_01", "wooden_lantern_01"].filter(id => !process.argv[2] || process.argv.slice(2).includes(id));
const root = new URL("../.asset-cache/environment/", import.meta.url);
for (const id of assets) {
  const response = await fetch("https://api.polyhaven.com/files/" + id);
  if (!response.ok) throw new Error(id + ": metadata " + response.status);
  const metadata = await response.json();
  const entry = metadata.gltf?.["2k"]?.gltf;
  if (!entry) throw new Error(id + ": no 2K glTF");
  const directory = new URL(id + "/", root);
  await mkdir(directory, { recursive: true });
  for (const [name, file] of Object.entries({ "model.gltf": entry, ...entry.include })) {
    const target = new URL(name, directory);
    if (!target.href.startsWith(directory.href)) throw new Error("Invalid asset path");
    const download = await fetch(file.url);
    if (!download.ok) throw new Error(file.url + ": " + download.status);
    const bytes = Buffer.from(await download.arrayBuffer());
    if (createHash("md5").update(bytes).digest("hex") !== file.md5) throw new Error("Checksum mismatch: " + name);
    await mkdir(new URL("./", target), { recursive: true });
    await writeFile(target, bytes);
  }
  console.log("Downloaded", id);
}
