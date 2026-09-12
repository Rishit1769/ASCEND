"use client";
import { useEffect, useMemo } from "react";
import { BufferGeometry, Color, Float32BufferAttribute } from "three";
import { useGraphicsQuality } from "../GraphicsQuality";
import { MOUNTAIN, MOUNTAIN_QUALITY, mountainHeight } from "./mountainConfig";

export default function MountainWorldShell() {
  const { preset } = useGraphicsQuality();
  const segments = MOUNTAIN_QUALITY[preset].segments;
  const geometry = useMemo(() => {
    const g = new BufferGeometry(), positions: number[] = [], colors: number[] = [], indices: number[] = [];
    const rings = [0, 8, 22, 45, 75, 115, 165, 220];
    const count = segments * 4;
    const color = new Color();
    rings.forEach((distance, ring) => {
      for (let i = 0; i < count; i++) {
        const side = Math.floor(i / segments), t = (i % segments) / segments;
        const u = side === 0 ? -1 + 2*t : side === 1 ? 1 : side === 2 ? 1 - 2*t : -1;
        const v = side === 0 ? -1 : side === 1 ? -1 + 2*t : side === 2 ? 1 : 1 - 2*t;
        const x = u * (MOUNTAIN.width / 2 + distance), z = MOUNTAIN.centerZ + v * (MOUNTAIN.length / 2 + distance);
        const edge = mountainHeight(u * MOUNTAIN.width / 2, MOUNTAIN.centerZ + v * MOUNTAIN.length / 2);
        const ridge = 18 + 34 * Math.pow(.5 + .5 * Math.sin(x*.023 + Math.sin(z*.017)*2), 2) + 22 * Math.sin(z*.031 + x*.012) ** 2;
        const blend = Math.min(1, distance / 45);
        const y = edge * (1-blend) + ridge * blend - 16 * Math.sin(distance*.045) ** 2;
        positions.push(x, y, z);
        color.set(y > 50 ? "#a7b6bc" : "#526975");
        color.multiplyScalar(.85 + .15 * Math.sin(x*.09)*Math.cos(z*.07));
        colors.push(color.r, color.g, color.b);
        if (ring < rings.length - 1) {
          const a = ring*count+i, b = ring*count+(i+1)%count, c = a+count, d = b+count;
          indices.push(a,b,c,b,d,c);
        }
      }
    });
    g.setAttribute("position", new Float32BufferAttribute(positions,3));
    g.setAttribute("color", new Float32BufferAttribute(colors,3));
    g.setIndex(indices); g.computeVertexNormals(); g.computeBoundingBox(); g.computeBoundingSphere();
    return g;
  }, [segments]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh name="continuous-mountain-world-shell" geometry={geometry} userData={{ backgroundMountain: true }}>
    <meshStandardMaterial vertexColors roughness={.95} />
  </mesh>;
}
