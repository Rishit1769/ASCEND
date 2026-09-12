"use client";
import { useContext, useEffect, useMemo } from "react";
import * as THREE from "three";
import { ForestWindContext } from "./ForestWind";
import { FOREST_QUALITY, randomSequence } from "./forestConfig";
import { useGraphicsQuality } from "../GraphicsQuality";

export default function ForestAtmosphere() {
  const { preset } = useGraphicsQuality();
  const time = useContext(ForestWindContext)!;
  const count = FOREST_QUALITY[preset].leaves;
  const geometry = useMemo(() => {
    const random = randomSequence(432);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) positions.set([(random() - .5) * 24, random() * 12, 15 - random() * 65], i * 3);
    const result = new THREE.BufferGeometry();
    result.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return result;
  }, [count]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  if (!count) return null;
  return <points geometry={geometry} frustumCulled={false} name="forest-gpu-leaves">
    <shaderMaterial transparent depthWrite={false} fog uniforms={{ time, ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog) }} vertexShader={`
      uniform float time; varying float angle;
      #include <common>
      #include <fog_pars_vertex>
      void main(){
        vec3 p=position; float phase=position.x*7.31+position.z*.83;
        p.y=mod(position.y-time*.23,12.)+.2;
        p.x+=sin(time*.48+phase)*1.2;p.z+=cos(time*.31+phase)*.6;
        angle=phase+time*.7;
        vec4 mvPosition=modelViewMatrix*vec4(p,1.);
        gl_Position=projectionMatrix*mvPosition;
        gl_PointSize=clamp(65./-mvPosition.z,1.,8.);
        #include <fog_vertex>
      }`} fragmentShader={`
      varying float angle;
      #include <common>
      #include <fog_pars_fragment>
      void main(){
        vec2 p=gl_PointCoord-.5; p=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*p;
        float leaf=1.-smoothstep(.7,1.,length(p*vec2(2.8,1.9)));
        if(leaf<.1)discard;
        gl_FragColor=vec4(vec3(.23,.19,.075),leaf*.75);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`} />
  </points>;
}
