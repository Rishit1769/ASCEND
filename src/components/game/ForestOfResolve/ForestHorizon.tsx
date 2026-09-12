"use client";
import { BackSide, Color } from "three";
import { useMemo } from "react";

// Match the distant air to the forest fog while retaining the existing photographic sky overhead.
export default function ForestHorizon() {
  const uniforms = useMemo(() => ({ air: { value: new Color("#526963") } }), []);
  return <mesh renderOrder={-80}>
    <sphereGeometry args={[150, 32, 16]} />
    <shaderMaterial transparent depthWrite={false} side={BackSide} uniforms={uniforms}
      vertexShader="varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}" fragmentShader={`
        varying vec3 direction;uniform vec3 air;
        void main(){float height=normalize(direction).y;gl_FragColor=vec4(air,1.-smoothstep(.06,.4,height));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`} />
  </mesh>;
}
