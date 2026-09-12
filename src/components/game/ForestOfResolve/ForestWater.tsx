"use client";
import { useContext, useEffect, useMemo } from "react";
import * as THREE from "three";
import TidalWater from "../TidalWater";
import { ForestWindContext } from "./ForestWind";
import { EnvironmentAsset } from "../EnvironmentAsset";
import { useGraphicsQuality } from "../GraphicsQuality";
import { randomSequence } from "./forestConfig";
import { useGLTF } from "@react-three/drei";
import { normalizeAsset } from "../grounding";

export default function ForestWater() {
  const time = useContext(ForestWindContext)!;
  const { config } = useGraphicsQuality();
  const { scene } = useGLTF("/environment/coastal_cliff_02-lod.glb");
  const cascade = useMemo(() => {
    const cliff = normalizeAsset(scene, 8);
    cliff.scale.y *= 6.5;
    cliff.position.set(9, -1, -51);
    cliff.updateMatrixWorld(true);
    const ray = new THREE.Raycaster(new THREE.Vector3(9, 30, -51), new THREE.Vector3(0, -1, 0));
    let top = -.48;
    for (let z = -53; z <= -49; z += .1) {
      ray.ray.origin.set(9, 30, z);
      const hit = ray.intersectObject(cliff, true)[0];
      if (hit) top = Math.max(top, hit.point.y);
    }
    const sheet = new THREE.PlaneGeometry(1.6, top + .48, 8, 40);
    const positions = sheet.attributes.position;
    const uv = sheet.attributes.uv;
    const direction = new THREE.Vector3(0, 0, -1);
    const origin = new THREE.Vector3();
    for (let i = 0; i < positions.count; i++) {
      const x = 9 + positions.getX(i);
      const y = -.48 + uv.getY(i) * (top + .48);
      ray.set(origin.set(x, y, -35), direction);
      const hit = ray.intersectObject(cliff, true)[0];
      positions.setXYZ(i, x, y, (hit?.point.z ?? -50) + .09);
    }
    sheet.computeVertexNormals();
    return sheet;
  }, [scene]);
  useEffect(() => () => cascade.dispose(), [cascade]);
  const mist = useMemo(() => {
    const random = randomSequence(934);
    const points = new Float32Array(32 * 3);
    for (let i = 0; i < 32; i++) points.set([(random() - .5) * 2.5, random() * 2.5, random() * 1.5], i * 3);
    return new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(points, 3));
  }, []);
  useEffect(() => () => mist.dispose(), [mist]);
  return <group name="forest-stream-and-falls">
    <TidalWater forest />
    <group position={[9, -1, -51]} scale={[1, 6.5, 1]}>
      <EnvironmentAsset id="coastal_cliff_02" width={8} low tint="#70887a" />
    </group>
    <mesh geometry={cascade} name="cliff-fed-waterfall">
      <shaderMaterial transparent depthWrite={false} side={THREE.DoubleSide} fog uniforms={{ time, ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog) }} vertexShader={`
        varying vec2 vUv;
        #include <common>
        #include <fog_pars_vertex>
        void main(){vUv=uv;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;
        #include <fog_vertex>
        }`} fragmentShader={`
        uniform float time;varying vec2 vUv;
        #include <common>
        #include <fog_pars_fragment>
        void main(){
          float edge=smoothstep(0.,.16,vUv.x)*smoothstep(0.,.16,1.-vUv.x);
          float streak=sin(vUv.x*67.+sin(vUv.y*19.+time*2.)*5.)*.5+.5;
          float pulse=sin(vUv.y*95.+time*8.+vUv.x*13.)*.5+.5;
          gl_FragColor=vec4(mix(vec3(.18,.29,.27),vec3(.49,.61,.56),streak),edge*(.23+streak*.23+pulse*.12));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`} />
    </mesh>
    {config.waterDetailEnabled && <points position={[9, -.4, -49.3]} geometry={mist} frustumCulled={false} name="waterfall-impact-mist">
      <shaderMaterial transparent depthWrite={false} fog uniforms={{ time, ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog) }} vertexShader={`
        uniform float time;varying float fade;
        #include <common>
        #include <fog_pars_vertex>
        void main(){vec3 p=position; p.y=mod(p.y+time*.25,2.5);p.x+=sin(time*.4+p.z*3.)*.45;
          fade=(1.-p.y/2.5)*.055;
          vec4 mvPosition=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mvPosition;gl_PointSize=clamp(700./-mvPosition.z,2.,90.);
          #include <fog_vertex>
        }`} fragmentShader={`
        varying float fade;
        #include <common>
        #include <fog_pars_fragment>
        void main(){float radial=length(gl_PointCoord-.5)*2.;if(radial>1.)discard;gl_FragColor=vec4(.62,.72,.68,exp(-radial*radial*5.)*fade);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`} />
    </points>}
  </group>;
}
