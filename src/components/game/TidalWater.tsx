"use client";
import { useEffect, useMemo } from "react";
import { applyProps, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import * as THREE from "three";
import { SEA_LEVEL, SEABED_Y } from "./grounding";
import { useTerrainSurface } from "./terrainSurface";
import { useGraphicsQuality } from "./GraphicsQuality";
import { useReducedMotion } from "./useReducedMotion";
import { SUN_DIRECTION } from "./skyConfig";

function reflectionUpdater(reflector: Reflector, camera: THREE.Camera, cadenceMs: number): THREE.Object3D["onBeforeRender"] {
  const renderReflection = reflector.onBeforeRender;
  let last = -Infinity;
  let lastFrame = -1;
  const previousCamera = new THREE.Matrix4();
  return function (renderer, scene, viewCamera, geometry, material, group) {
    if (viewCamera !== camera || scene.overrideMaterial) return;
    if (lastFrame === reflector.userData.frame) return;
    const now = performance.now();
    const moved = !previousCamera.equals(camera.matrixWorld);
    if (moved || now - last >= cadenceMs) {
      renderReflection.call(reflector, renderer, scene, viewCamera, geometry, material, group);
      previousCamera.copy(camera.matrixWorld);
      last = now;
      lastFrame = reflector.userData.frame;
      reflector.userData.reflectionUpdates = (reflector.userData.reflectionUpdates ?? 0) + 1;
    }
  };
}

export default function TidalWater() {
  const sample = useTerrainSurface();
  const { config } = useGraphicsQuality();
  const reduced = useReducedMotion();
  const camera = useThree(state => state.camera);
  const normals = useTexture("/environment/waternormals.jpg");
  const bathymetry = useMemo(() => {
    const size = 256;
    const data = new Uint8Array(size * size);
    for (let z = 0; z < size; z++) for (let x = 0; x < size; x++) {
      const height = sample(-45 + x / (size - 1) * 90, -65 + z / (size - 1) * 90).point.y;
      data[z * size + x] = Math.round(THREE.MathUtils.clamp((height - SEABED_Y) / 8, 0, 1) * 255);
    }
    const map = new THREE.DataTexture(data, size, size, THREE.RedFormat);
    map.minFilter = map.magFilter = THREE.LinearFilter;
    map.needsUpdate = true;
    return map;
  }, [sample]);
  useEffect(() => () => bathymetry.dispose(), [bathymetry]);

  const water = useMemo(() => {
    const normal = normals.clone();
    normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
    normal.colorSpace = THREE.NoColorSpace;
    normal.needsUpdate = true;
    const resolution = config.waterResolution;
    const reflector = new Reflector(new THREE.PlaneGeometry(160, 160), { textureWidth: resolution, textureHeight: resolution, clipBias: .003, multisample: 0 });
    reflector.name = "shallow-coastal-water";
    reflector.rotation.x = -Math.PI / 2;
    reflector.position.set(0, SEA_LEVEL, -25);
    const material = reflector.material as THREE.ShaderMaterial;
    material.transparent = true;
    material.depthWrite = false;
    material.fog = true;
    Object.assign(material.uniforms, THREE.UniformsUtils.clone(THREE.UniformsLib.fog), {
      normalMap: { value: normal }, depthMap: { value: bathymetry }, time: { value: 0 }, sun: { value: SUN_DIRECTION },
      shallow: { value: new THREE.Color("#496c68") }, deep: { value: new THREE.Color("#162b2f") },
      texel: { value: 1 / resolution },
    });
    material.vertexShader = `
      uniform mat4 textureMatrix;
      varying vec4 projected; varying vec3 worldPoint;
      #include <common>
      #include <fog_pars_vertex>
      void main(){
        projected=textureMatrix*vec4(position,1.);
        worldPoint=(modelMatrix*vec4(position,1.)).xyz;
        vec4 mvPosition=modelViewMatrix*vec4(position,1.);
        gl_Position=projectionMatrix*mvPosition;
        #include <fog_vertex>
      }`;
    material.fragmentShader = `
      uniform sampler2D tDiffuse, normalMap, depthMap;
      uniform float time, texel;
      uniform vec3 shallow, deep, sun;
      varying vec4 projected; varying vec3 worldPoint;
      #include <common>
      #include <fog_pars_fragment>
      void main(){
        vec3 a=texture2D(normalMap,worldPoint.xz*.13+vec2(time*.009,time*.004)).xyz*2.-1.;
        vec3 b=texture2D(normalMap,worldPoint.zx*.21+vec2(-time*.005,time*.007)).xyz*2.-1.;
        vec3 n=normalize(vec3((a.x+b.y)*.12,1.,(a.y+b.x)*.12));
        vec3 view=normalize(cameraPosition-worldPoint);
        float fresnel=.02+.98*pow(1.-max(dot(view,n),0.),5.);
        vec2 uv=projected.xy/projected.w+n.xz*.016;
        float roughness=.3+.1*sin(worldPoint.x*.43+worldPoint.z*.3+time*.15);
        vec2 spread=vec2(texel*(1.+roughness*2.));
        vec3 reflection=texture2D(tDiffuse,uv).rgb*.4;
        reflection+=(texture2D(tDiffuse,uv+vec2(spread.x,0)).rgb+texture2D(tDiffuse,uv-vec2(spread.x,0)).rgb+texture2D(tDiffuse,uv+vec2(0,spread.y)).rgb+texture2D(tDiffuse,uv-vec2(0,spread.y)).rgb)*.15;
        float floorY=${SEABED_Y.toFixed(2)}+texture2D(depthMap,(worldPoint.xz-vec2(-45.,-65.))/90.).r*8.;
        float depth=max(0.,worldPoint.y-floorY);
        float absorption=1.-exp(-depth*1.6);
        vec3 body=mix(shallow,deep,absorption)*(.75+.25*max(dot(n,sun),0.));
        float glint=pow(max(dot(normalize(sun+view),n),0.),160.)*.15;
        vec3 color=mix(body,reflection,fresnel*.88)+vec3(1.,.89,.7)*glint;
        float foam=(1.-smoothstep(.025,.16,depth))*smoothstep(.2,.6,a.x+b.y)*.12;
        color+=vec3(.32,.37,.36)*foam;
        float alpha=clamp(.18+absorption*.67+fresnel*.55,0.,.97);
        gl_FragColor=vec4(color,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`;
    material.needsUpdate = true;
    reflector.onBeforeRender = reflectionUpdater(reflector, camera, config.waterReflectionCadence);
    return reflector;
  }, [config.waterResolution, config.waterReflectionCadence, normals, bathymetry, camera]);
  useEffect(() => () => {
    (water.material as THREE.ShaderMaterial).uniforms.normalMap.value.dispose();
    water.dispose(); water.geometry.dispose();
  }, [water]);
  useFrame(({ gl }, delta) => {
    applyProps(water.userData, { frame: (water.userData.frame ?? 0) + 1 });
    const time = (water.material as THREE.ShaderMaterial).uniforms.time;
    if (!reduced) applyProps(time, { value: time.value + Math.min(delta, .05) });
    if (process.env.NODE_ENV === "development" && water.userData.frame % 60 === 0) gl.domElement.dataset.waterState = JSON.stringify({ time: time.value, resolution: water.getRenderTarget().width, reflections: water.userData.reflectionUpdates });
  });
  return <primitive object={water} dispose={null} />;
}
