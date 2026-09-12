import { writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

// Poly Haven CC0. Keep source checksums beside the downloaded textures.
const metadata = await (await fetch("https://api.polyhaven.com/files/forest_leaves_02")).json();
const sources = [];
for (const channel of ["Diffuse", "nor_gl", "Rough"]) {
  const source = metadata[channel]["1k"].jpg;
  const response = await fetch(source.url);
  if (!response.ok) throw new Error(`${source.url}: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (createHash("md5").update(bytes).digest("hex") !== source.md5) throw new Error("Checksum mismatch");
  const file = `forest-floor-${channel}.jpg`;
  await writeFile(new URL(`../public/environment/${file}`, import.meta.url), bytes);
  sources.push({ file, ...source });
}
await writeFile(new URL("../public/environment/forest-sources.json", import.meta.url), JSON.stringify({ license: "CC0-1.0", author: "Poly Haven", asset: "https://polyhaven.com/a/forest_leaves_02", sources }, null, 2));
