import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const directory = new URL("../public/environment/", import.meta.url);
await mkdir(directory, { recursive: true });
const assets = [
  { file: "kloofendal_48d_partly_cloudy_2k.hdr", url: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/kloofendal_48d_partly_cloudy_2k.hdr", md5: "72b472b131798b3eb5fc67fce3ab672e" },
  { file: "waternormals.jpg", url: "https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/textures/waternormals.jpg" },
];
for (const asset of assets) {
  const response = await fetch(asset.url);
  if (!response.ok) throw new Error(`${asset.file}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const md5 = createHash("md5").update(bytes).digest("hex");
  if (asset.md5 && asset.md5 !== md5) throw new Error(`${asset.file}: checksum mismatch`);
  await writeFile(new URL(asset.file, directory), bytes);
  console.log(asset.file, bytes.length, md5);
}
