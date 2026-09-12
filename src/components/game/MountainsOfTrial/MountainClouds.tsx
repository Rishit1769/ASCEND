"use client";
import { useContext, useMemo } from "react";
import * as THREE from "three";
import { useWorldProgress } from "../WorldProgress";
import { useGraphicsQuality } from "../GraphicsQuality";
import { MountainWindContext } from "./MountainWind";
import { checkpointForLevel, MOUNTAIN_QUALITY, randomSequence } from "./mountainConfig";

export default function MountainClouds() {
  const { level } = useWorldProgress();
  const { preset } = useGraphicsQuality();
  const wind = useContext(MountainWindContext);
  const checkpoint = checkpointForLevel(level);
  const quality = MOUNTAIN_QUALITY[preset];
  const planes = useMemo(() => {
    const random = randomSequence(8100 + level);
    return Array.from({ length: quality.clouds }, () => {
      const angle = random() * Math.PI * 2;
      const radius = 18 + random() * 50;
      const zBias = level >= 14 ? -18 : 4;
      return {
        position: [Math.cos(angle) * radius, checkpoint.cloudLevel + (random() - .5) * 7, checkpoint.position[2] + zBias + Math.sin(angle) * radius] as [number, number, number],
        scale: [18 + random() * 38, 1, 7 + random() * 15] as [number, number, number],
        rotation: random() * Math.PI,
        seed: random() * 100,
      };
    });
  }, [checkpoint, level, quality.clouds]);
  const uniforms = useMemo(() => ({ time: wind ?? { value: 0 }, color: { value: new THREE.Color("#d9e4e7") } }), [wind]);
  return <group name="mountain-cloud-layer">
    {planes.map((cloud, index) => <mesh key={index} position={cloud.position} scale={cloud.scale} rotation={[0, cloud.rotation, 0]} renderOrder={-10}>
      <planeGeometry args={[1, 1, 12, 3]} />
      <shaderMaterial transparent depthWrite={false} uniforms={uniforms} vertexShader="uniform float time;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.y+=sin(time*.2+position.x*5.)*.04;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}" fragmentShader={`uniform vec3 color;uniform float time;varying vec2 vUv;void main(){vec2 p=vUv*2.-1.;float edge=1.-smoothstep(.55,1.05,length(p*vec2(1.,1.6)));float noise=sin((vUv.x+time*.015)*24.)*sin((vUv.y-time*.01)*17.)*.08;gl_FragColor=vec4(color*(.82+noise),edge*.34);}`} />
    </mesh>)}
    <mesh position={[0, checkpoint.cloudLevel - (level >= 14 ? 7 : 2), -58]} scale={[125, 1, 58]} renderOrder={-20}>
      <planeGeometry args={[1, 1, 24, 4]} />
      <meshBasicMaterial color="#d7e0e3" transparent opacity={level >= 14 ? .34 : .16} depthWrite={false} />
    </mesh>
  </group>;
}
