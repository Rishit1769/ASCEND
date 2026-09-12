"use client";
import { useMemo } from "react";
import { BufferGeometry, Color, Float32BufferAttribute } from "three";
import { EnvironmentAsset, GroundedAsset } from "../EnvironmentAsset";
import { useGraphicsQuality } from "../GraphicsQuality";
import { MOUNTAIN_QUALITY, mountainHeight, pathX, randomSequence } from "./mountainConfig";

export default function MountainCliffs() {
  const { preset } = useGraphicsQuality();
  const quality = MOUNTAIN_QUALITY[preset];
  const silhouettes = useMemo(() => {
    const random = randomSequence(9301);
    return Array.from({ length: preset === "potato" ? 8 : 14 }, (_, index) => {
      const angle = index / (preset === "potato" ? 8 : 14) * Math.PI * 2 + random() * .2;
      const radius = 70 + random() * 18;
      return { x: Math.cos(angle) * radius, z: -31 + Math.sin(angle) * radius, height: 24 + random() * 36, width: 24 + random() * 24, depth: 10 + random() * 12, rotation: -angle + Math.PI / 2, seed: random() };
    });
  }, [preset]);
  const geometry = useMemo(() => {
    const segments = 8;
    const positions: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const x = -0.5 + i / segments;
      const top = .62 + Math.sin(i * 2.7) * .14 + Math.sin(i * 5.1) * .08;
      positions.push(x, 0, -.5, x, top, -.5, x, 0, .5, x, top * .92, .5);
    }
    for (let i = 0; i < segments; i++) {
      const a = i * 4;
      const b = (i + 1) * 4;
      indices.push(a, b, a + 1, b, b + 1, a + 1, a + 2, a + 3, b + 2, b + 2, a + 3, b + 3, a, a + 2, b, b, a + 2, b + 2, a + 1, b + 1, a + 3, b + 1, b + 3, a + 3);
    }
    const result = new BufferGeometry();
    result.setAttribute("position", new Float32BufferAttribute(positions, 3));
    result.setIndex(indices);
    result.computeVertexNormals();
    return result;
  }, []);
  const rocks = useMemo(() => {
    const random = randomSequence(5412);
    return Array.from({ length: quality.rocks }, () => {
      const z = 24 - random() * 106;
      const side = random() > .5 ? 1 : -1;
      const x = pathX(z) + side * (5.8 + random() * 22);
      return { position: [x, mountainHeight(x, z) - .15, z] as [number, number, number], rotation: random() * Math.PI * 2, scale: .6 + random() * 1.7 };
    });
  }, [quality.rocks]);

  return <group name="mountain-cliffs-and-rock-fields" userData={{ cameraObstacle: true }}>
    {silhouettes.map((peak, index) => (
      <mesh key={index} geometry={geometry} position={[peak.x, -3, peak.z]} scale={[peak.width, peak.height, peak.depth]} rotation={[0, peak.rotation, 0]} receiveShadow={false} userData={{ backgroundMountain: true }}>
        <meshStandardMaterial color={new Color(index % 3 ? "#667983" : "#7f8d92")} roughness={.96} metalness={0} fog />
      </mesh>
    ))}
    <EnvironmentAsset id="coastal_cliff_02" low={preset === "low" || preset === "potato"} width={34} position={[-50, 8, -34]} rotation={Math.PI * .46} castShadow={quality.shadowCasters} tint="#b8c2c3" />
    <EnvironmentAsset id="coastal_cliff_02" low={preset === "low" || preset === "potato"} width={38} position={[52, 16, -62]} rotation={-Math.PI * .54} castShadow={quality.shadowCasters} tint="#aeb9bd" />
    <EnvironmentAsset id="coastal_cliff_02" low width={48} position={[0, 30, -118]} rotation={Math.PI} castShadow={false} tint="#d1d8da" />
    {rocks.slice(0, Math.min(rocks.length, 18)).map((rock, index) => <GroundedAsset key={index} id="rock_moss_set_01" low={preset !== "ultra"} width={2.2 * rock.scale} position={rock.position} rotation={rock.rotation} castShadow={quality.shadowCasters} tint={rock.position[2] < -42 ? "#c7cdcc" : "#9fa79f"} normalAlignment={.18} burial={.08} />)}
  </group>;
}
