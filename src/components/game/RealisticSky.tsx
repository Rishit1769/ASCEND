"use client";
import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import * as THREE from "three";
import { HDR_SKY, SKY_ROTATION, SUN_DIRECTION } from "./skyConfig";
import { useReducedMotion } from "./useReducedMotion";

export default function RealisticSky({ capture = false }: { capture?: boolean }) {
  const photograph = useLoader(HDRLoader, HDR_SKY);
  const reduced = useReducedMotion();
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ cloudSky: { value: photograph }, time: { value: 0 }, rotation: { value: SKY_ROTATION } }), [photograph]);
  useFrame((_, delta) => {
    if (!reduced && !capture && material.current) material.current.uniforms.time.value += Math.min(delta, .05);
  });
  return <group name="physical-atmosphere-and-hdr-clouds">
    <Sky distance={450} sunPosition={SUN_DIRECTION} turbidity={8} rayleigh={1.2} mieCoefficient={.006} mieDirectionalG={.82} />
    <mesh renderOrder={-90}>
      <sphereGeometry args={[400, 48, 24]} />
      <shaderMaterial ref={material} uniforms={uniforms} side={THREE.BackSide} transparent depthWrite={false} toneMapped={!capture}
        vertexShader={`varying vec3 direction; void main(){ direction=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`}
        fragmentShader={`
          varying vec3 direction; uniform sampler2D cloudSky; uniform float rotation,time;
          void main(){
            vec3 d=normalize(direction);
            vec2 uv=vec2(atan(d.z,d.x)/6.2831853+.5+rotation/6.2831853,asin(d.y)/3.14159265+.5);
            uv.x+=sin(time*.012+uv.y*9.)*.0008;
            uv.y+=sin(time*.009+uv.x*13.)*.0004;
            vec3 radiance=texture2D(cloudSky,vec2(fract(uv.x),uv.y)).rgb;
            float luminance=dot(radiance,vec3(.2126,.7152,.0722));
            radiance=mix(vec3(luminance),radiance,.7);
            radiance=min(radiance,vec3(12.))*.42;
            // Hide the photographed landscape; the physical scattering model owns the horizon.
            float alpha=smoothstep(.005,.12,d.y)*.97;
            gl_FragColor=vec4(radiance,alpha);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`}
      />
    </mesh>
  </group>;
}
