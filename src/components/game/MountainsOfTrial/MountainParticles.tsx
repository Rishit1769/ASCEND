"use client";
import { useContext, useMemo } from "react";
import * as THREE from "three";
import { useWorldProgress } from "../WorldProgress";
import { useGraphicsQuality } from "../GraphicsQuality";
import { MountainWindContext } from "./MountainWind";
import { checkpointForLevel, MOUNTAIN_QUALITY, randomSequence } from "./mountainConfig";

export default function MountainParticles() {
  const { level } = useWorldProgress();
  const { preset } = useGraphicsQuality();
  const wind = useContext(MountainWindContext);
  const checkpoint = checkpointForLevel(level);
  const quality = MOUNTAIN_QUALITY[preset];
  const snowCount = level >= 14 ? quality.snow : Math.floor(quality.debris * .35);
  const geometry = useMemo(() => {
    const random = randomSequence(4400 + level + snowCount);
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(snowCount * 3);
    for (let i = 0; i < snowCount; i++) {
      positions[i * 3] = (random() - .5) * 44;
      positions[i * 3 + 1] = checkpoint.elevation + random() * 18;
      positions[i * 3 + 2] = checkpoint.position[2] + (random() - .5) * 38;
    }
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [checkpoint, level, snowCount]);
  const uniforms = useMemo(() => ({
    time: wind ?? { value: 0 },
    color: { value: new THREE.Color(level >= 14 ? "#edf4f5" : "#afa290") },
    isSnow: { value: level >= 14 ? 1 : 0 },
  }), [wind, level]);
  if (!snowCount) return null;
  return <points geometry={geometry} name="mountain-wind-particles">
    <shaderMaterial transparent depthWrite={false} uniforms={uniforms} vertexShader="uniform float time;uniform float isSnow;void main(){vec3 p=position;p.x+=time*(isSnow>.5?5.4:2.1);p.z-=time*(isSnow>.5?2.2:.8);p.y-=fract(time*.08+position.x*.013)*(isSnow>.5?7.5:1.8);p.x=mod(p.x+24.,48.)-24.;gl_PointSize=(isSnow>.5?2.2:1.5)*(260./-modelViewMatrix[3].z);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}" fragmentShader="uniform vec3 color;void main(){vec2 d=gl_PointCoord-.5;float a=1.-smoothstep(.18,.5,length(d));gl_FragColor=vec4(color,a*.58);}" />
  </points>;
}
