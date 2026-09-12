"use client";
import { useEffect, useMemo } from "react";
import { applyProps, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import * as THREE from "three";
import { SEA_LEVEL, SEABED_Y } from "./grounding";
import { useTerrainSurface } from "./terrainSurface";
import { useGraphicsQuality } from "./GraphicsQuality";
import { useReducedMotion } from "./useReducedMotion";
import { SUN_DIRECTION } from "./skyConfig";

function reflectionUpdater(reflector: Reflector, enabled: boolean, cadenceMs: number): THREE.Object3D["onBeforeRender"] {
  const renderReflection = reflector.onBeforeRender;
  let lastFrame = -1;
  let last = -Infinity;
  return function (renderer, scene, viewCamera, geometry, material, group) {
    if (scene.overrideMaterial) return;
    if (lastFrame === reflector.userData.frame) return;
    if (!enabled) {
      lastFrame = reflector.userData.frame;
      return;
    }
    const now = performance.now();
    if (now - last < cadenceMs) return;
    renderReflection.call(reflector, renderer, scene, viewCamera, geometry, material, group);
    last = now;
    lastFrame = reflector.userData.frame;
    reflector.userData.reflectionUpdates = (reflector.userData.reflectionUpdates ?? 0) + 1;
  };
}

export default function TidalWater() {
  const sample = useTerrainSurface();
  const { config } = useGraphicsQuality();
  const reduced = useReducedMotion();
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
    const segments = config.waterGeometrySegments;
    const reflector = new Reflector(new THREE.PlaneGeometry(160, 160, segments, segments), { textureWidth: resolution, textureHeight: resolution, clipBias: .003, multisample: 0 });
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
      mid: { value: new THREE.Color("#315d61") }, skyTint: { value: new THREE.Color("#9db7c1") },
      texel: { value: 1 / resolution },
      waveStrength: { value: config.waterWaveStrength },
      normalStrength: { value: config.waterNormalStrength },
      reflectionStrength: { value: config.waterReflectionEnabled ? 1 : 0 },
      refractionStrength: { value: config.waterRefractionStrength },
    });
    material.vertexShader = `
      uniform mat4 textureMatrix; uniform float time,waveStrength;
      varying vec4 projected; varying vec3 worldPoint; varying float waveCrest;
      #include <common>
      #include <fog_pars_vertex>
      float wave(vec2 d,float wavelength,float speed,float amplitude,vec2 p){
        float phase=dot(normalize(d),p)*6.2831853/wavelength+time*speed;
        return sin(phase)*amplitude;
      }
      void main(){
        vec3 displaced=position;
        vec2 p=(modelMatrix*vec4(position,1.)).xz;
        float w1=wave(vec2(.78,.25),22.,.36,.115,p);
        float w2=wave(vec2(-.35,.94),12.,.58,.065,p);
        float w3=wave(vec2(.28,-.96),7.2,.82,.032,p);
        float w4=wave(vec2(-.88,-.48),3.4,1.34,.014,p);
        float longSwell=w1+w2+w3+w4;
        displaced.z += (cos(dot(normalize(vec2(.78,.25)),p)*.285+time*.36)*.045 + cos(dot(normalize(vec2(-.35,.94)),p)*.52+time*.58)*.022) * waveStrength;
        displaced.y += longSwell * waveStrength;
        waveCrest=smoothstep(.055,.17,longSwell*waveStrength);
        vec4 world= modelMatrix*vec4(displaced,1.);
        projected=textureMatrix*vec4(displaced,1.);
        worldPoint=world.xyz;
        vec4 mvPosition=modelViewMatrix*vec4(displaced,1.);
        gl_Position=projectionMatrix*mvPosition;
        #include <fog_vertex>
      }`;
    material.fragmentShader = `
      uniform sampler2D tDiffuse, normalMap, depthMap;
      uniform float time, texel, normalStrength, reflectionStrength, refractionStrength;
      uniform vec3 shallow, mid, deep, skyTint, sun;
      varying vec4 projected; varying vec3 worldPoint; varying float waveCrest;
      #include <common>
      #include <fog_pars_fragment>
      void main(){
        vec2 flowA=worldPoint.xz*.115+vec2(time*.018,time*.006);
        vec2 flowB=mat2(.62,-.78,.78,.62)*worldPoint.xz*.255+vec2(-time*.011,time*.017);
        vec2 flowC=worldPoint.zx*.62+vec2(time*.031,-time*.021);
        vec3 a=texture2D(normalMap,flowA).xyz*2.-1.;
        vec3 b=texture2D(normalMap,flowB).xyz*2.-1.;
        vec3 c=texture2D(normalMap,flowC).xyz*2.-1.;
        vec3 n=normalize(vec3((a.x*.7+b.y*.55+c.x*.18)*.145*normalStrength,1.,(a.y*.68+b.x*.52+c.y*.16)*.145*normalStrength));
        vec3 view=normalize(cameraPosition-worldPoint);
        float fresnel=.02+.98*pow(1.-max(dot(view,n),0.),5.);
        vec2 uv=projected.xy/projected.w+n.xz*(.011+.012*refractionStrength);
        float roughness=.24+.16*sin(worldPoint.x*.43+worldPoint.z*.3+time*.15);
        vec2 spread=vec2(texel*(1.2+roughness*3.));
        vec3 reflected=texture2D(tDiffuse,uv).rgb*.38;
        reflected+=(texture2D(tDiffuse,uv+vec2(spread.x,0)).rgb+texture2D(tDiffuse,uv-vec2(spread.x,0)).rgb+texture2D(tDiffuse,uv+vec2(0,spread.y)).rgb+texture2D(tDiffuse,uv-vec2(0,spread.y)).rgb)*.155;
        vec3 horizonReflection=mix(skyTint,vec3(1.,.88,.68),pow(max(dot(normalize(sun+view),n),0.),18.)*.18);
        vec3 reflection=mix(horizonReflection,reflected,reflectionStrength);
        float floorY=${SEABED_Y.toFixed(2)}+texture2D(depthMap,(worldPoint.xz-vec2(-45.,-65.))/90.).r*8.;
        float depth=max(0.,worldPoint.y-floorY);
        float absorption=1.-exp(-depth*1.22);
        vec3 depthColor=mix(shallow,mid,smoothstep(.0,.42,absorption));
        depthColor=mix(depthColor,deep,smoothstep(.38,1.,absorption));
        float lambert=.68+.32*max(dot(n,normalize(sun)),0.);
        vec3 body=depthColor*lambert;
        float glint=pow(max(dot(normalize(sun+view),n),0.),180.)*.22;
        float shore=1.-smoothstep(.045,.34,depth);
        float foamNoise=smoothstep(.48,.9,a.x*.45+b.y*.35+c.x*.2+.5);
        float foam=max(shore*foamNoise*.24,waveCrest*smoothstep(.32,.78,depth)*.13);
        vec3 color=mix(body,reflection,clamp(fresnel*(.62+.28*reflectionStrength),0.,.92))+vec3(1.,.9,.68)*glint;
        color=mix(color,vec3(.74,.82,.78),foam);
        float alpha=clamp(.13+absorption*.64+fresnel*.5+shore*.04,0.,.96);
        gl_FragColor=vec4(color,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`;
    material.needsUpdate = true;
    reflector.onBeforeRender = reflectionUpdater(reflector, config.waterReflectionEnabled, config.waterReflectionCadence);
    return reflector;
  }, [config.waterResolution, config.waterGeometrySegments, config.waterWaveStrength, config.waterNormalStrength, config.waterReflectionEnabled, config.waterReflectionCadence, config.waterRefractionStrength, normals, bathymetry]);
  useEffect(() => () => {
    (water.material as THREE.ShaderMaterial).uniforms.normalMap.value.dispose();
    water.dispose(); water.geometry.dispose();
  }, [water]);
  useFrame(({ gl }, delta) => {
    applyProps(water.userData, { frame: (water.userData.frame ?? 0) + 1 });
    const time = (water.material as THREE.ShaderMaterial).uniforms.time;
    if (!reduced) applyProps(time, { value: time.value + Math.min(delta, .05) });
    if (process.env.NODE_ENV === "development" && water.userData.frame % 60 === 0) gl.domElement.dataset.waterState = JSON.stringify({ time: time.value, resolution: water.getRenderTarget().width, reflections: water.userData.reflectionUpdates, segments: config.waterGeometrySegments, realtimeReflection: config.waterReflectionEnabled });
  });
  return <primitive object={water} dispose={null} />;
}
