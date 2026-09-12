"use client";
import { useMemo } from "react";
import { ConeGeometry, Color } from "three";
import { EnvironmentAsset, GroundedAsset } from "../EnvironmentAsset";
import { useGraphicsQuality } from "../GraphicsQuality";
import { MOUNTAIN_QUALITY, mountainHeight, pathX, randomSequence } from "./mountainConfig";

export default function MountainCliffs() {
  const { preset } = useGraphicsQuality();
  const quality = MOUNTAIN_QUALITY[preset];
  const silhouettes = useMemo(() => {
    const random = randomSequence(9301);
    return Array.from({ length: preset === "potato" ? 7 : 12 }, (_, index) => {
      const side = index % 2 ? 1 : -1;
      const z = 20 - index * 9.5;
      const x = side * (32 + random() * 16);
      const height = 28 + random() * 42 + Math.max(0, -z) * .35;
      return { x, z, height, radius: 8 + random() * 12, rotation: random() * Math.PI };
    });
  }, [preset]);
  const geometry = useMemo(() => new ConeGeometry(1, 1, 7, 4), []);
  const rocks = useMemo(() => {
    const random = randomSequence(5412);
    return Array.from({ length: quality.rocks }, () => {
      const z = 24 - random() * 106;
      const side = random() > .5 ? 1 : -1;
      const x = pathX(z) + side * (5.8 + random() * 22);
      return { position: [x, mountainHeight(x, z) - .15, z] as [number, number, number], rotation: random() * Math.PI * 2, scale: .6 + random() * 1.7 };
    });
  }, [quality.rocks]);

  return <group name="mountain-cliffs-and-rock-fields">
    {silhouettes.map((peak, index) => (
      <mesh key={index} geometry={geometry} position={[peak.x, peak.height * .48 - 4, peak.z]} scale={[peak.radius, peak.height, peak.radius * .72]} rotation={[0, peak.rotation, 0]} receiveShadow>
        <meshStandardMaterial color={new Color(index % 3 ? "#63727a" : "#7a8588")} roughness={.94} metalness={0} />
      </mesh>
    ))}
    <EnvironmentAsset id="coastal_cliff_02" low={preset === "low" || preset === "potato"} width={34} position={[-50, 8, -34]} rotation={Math.PI * .46} castShadow={quality.shadowCasters} tint="#b8c2c3" />
    <EnvironmentAsset id="coastal_cliff_02" low={preset === "low" || preset === "potato"} width={38} position={[52, 16, -62]} rotation={-Math.PI * .54} castShadow={quality.shadowCasters} tint="#aeb9bd" />
    <EnvironmentAsset id="coastal_cliff_02" low width={48} position={[0, 30, -118]} rotation={Math.PI} castShadow={false} tint="#d1d8da" />
    {rocks.slice(0, Math.min(rocks.length, 18)).map((rock, index) => <GroundedAsset key={index} id="rock_moss_set_01" low={preset !== "ultra"} width={2.2 * rock.scale} position={rock.position} rotation={rock.rotation} castShadow={quality.shadowCasters} tint={rock.position[2] < -42 ? "#c7cdcc" : "#9fa79f"} normalAlignment={.18} burial={.08} />)}
  </group>;
}
