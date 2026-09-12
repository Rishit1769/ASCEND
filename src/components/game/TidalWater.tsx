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
import { FOREST_REFLECTION } from "./ForestOfResolve/forestConfig";
import { REALM_QUALITY } from "./RealmOfAscension/realmConfig";

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

export default function TidalWater({ forest = false, realm = false }: { forest?: boolean; realm?: boolean }) {
  const sample = useTerrainSurface();
  const { config: graphics, preset } = useGraphicsQuality();
  const quality = REALM_QUALITY[preset];
  const reduced = useReducedMotion();
  const normals = useTexture("/environment/waternormals.jpg");

  // ── Stable config: only depends on graphics object identity + preset-derived values ──
  const waterConfig = useMemo(() => {
    const base = {
      resolution: graphics.waterResolution,
      segments: graphics.waterGeometrySegments,
      waveStrength: graphics.waterWaveStrength,
      normalStrength: graphics.waterNormalStrength,
      reflectionEnabled: graphics.waterReflectionEnabled,
      cadence: graphics.waterReflectionCadence,
      refractionStrength: graphics.waterRefractionStrength,
      waveLayers: graphics.waterWaveLayers,
      normalLayers: graphics.waterNormalLayers,
      foamEnabled: graphics.waterFoamEnabled,
      detailEnabled: graphics.waterDetailEnabled,
    };
    if (realm) {
      return { ...base, resolution: quality.reflection, segments: quality.segments, cadence: 1000 / 20, foamEnabled: false, reflectionEnabled: quality.reflection > 0 };
    }
    if (forest) {
      const fr = FOREST_REFLECTION[preset];
      return { ...base, resolution: fr.resolution, cadence: fr.cadence, reflectionEnabled: fr.enabled };
    }
    return base;
  }, [graphics, realm, forest, preset, quality]);

  // ── Bathymetry (stable — only depends on sample function + realm) ──
  const bathymetry = useMemo(() => {
    const size = 256;
    const data = new Uint8Array(size * size);
    for (let z = 0; z < size; z++) for (let x = 0; x < size; x++) {
      const height = realm ? -.5 : sample(-45 + x / (size - 1) * 90, -65 + z / (size - 1) * 90).point.y;
      data[z * size + x] = Math.round(THREE.MathUtils.clamp((height - SEABED_Y) / 8, 0, 1) * 255);
    }
    const map = new THREE.DataTexture(data, size, size, THREE.RedFormat);
    map.minFilter = map.magFilter = THREE.LinearFilter;
    map.needsUpdate = true;
    return map;
  }, [sample, realm]);
  useEffect(() => () => bathymetry.dispose(), [bathymetry]);

  // ── Material: only recreated when SHADER-DEFINING values change ──
  // Uniforms-only changes (waveStrength, normalStrength, etc.) are handled by useEffect below.
  const { material, timeUniform } = useMemo(() => {
    const normal = normals.clone();
    normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
    normal.colorSpace = THREE.NoColorSpace;
    normal.needsUpdate = true;

    const reflectionSample = waterConfig.reflectionEnabled ? `
        vec2 uv=projected.xy/projected.w+n.xz*(.011+.012*refractionStrength);
        float roughness=${realm ? ".22+.06*sin(worldPoint.x*.33+worldPoint.z*.24+time*.06)" : ".24+.16*sin(worldPoint.x*.43+worldPoint.z*.3+time*.15)"};
        vec2 spread=vec2(texel*(1.2+roughness*${realm ? "1.8" : "3."}));
        vec3 reflected=texture2D(tDiffuse,uv).rgb*.38;
        reflected+=(texture2D(tDiffuse,uv+vec2(spread.x,0)).rgb+texture2D(tDiffuse,uv-vec2(spread.x,0)).rgb+texture2D(tDiffuse,uv+vec2(0,spread.y)).rgb+texture2D(tDiffuse,uv-vec2(0,spread.y)).rgb)*.155;
        vec3 horizonReflection=mix(skyTint,vec3(1.,.88,.68),pow(max(dot(normalize(sun+view),n),0.),18.)*.18);
        vec3 reflection=mix(horizonReflection,reflected,reflectionStrength);` : `
        vec3 reflection=skyTint;`;
    const normalLayers = waterConfig.normalLayers >= 3 ? `
        vec3 b=texture2D(normalMap,flowB).xyz*2.-1.;
        vec3 c=texture2D(normalMap,flowC).xyz*2.-1.;` : waterConfig.normalLayers === 2 ? `
        vec3 b=texture2D(normalMap,flowB).xyz*2.-1.;
        vec3 c=vec3(0.);` : `
        vec3 b=vec3(0.); vec3 c=vec3(0.);`;
    const foam = waterConfig.foamEnabled ? `
        float shore=1.-smoothstep(.045,.34,depth);
        float foamNoise=smoothstep(.48,.9,a.x*.45+b.y*.35+c.x*.2+.5);
        float foam=max(shore*foamNoise*.24,waveCrest*smoothstep(.32,.78,depth)*.13);` : `
        float shore=0.;
        float foam=0.;`;

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      fog: true,
      vertexShader: `
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
          float w1=${waterConfig.waveLayers > 0 ? "wave(vec2(.78,.25),22.,.36,.115,p)" : "0."};
          float w2=${waterConfig.waveLayers >= 2 ? "wave(vec2(-.35,.94),12.,.58,.065,p)" : "0."};
          float w3=${waterConfig.waveLayers >= 3 ? "wave(vec2(.28,-.96),7.2,.82,.032,p)" : "0."};
          float w4=${waterConfig.waveLayers >= 4 ? "wave(vec2(-.88,-.48),3.4,1.34,.014,p)" : "0."};
          float w5=${waterConfig.waveLayers >= 5 ? "wave(vec2(.92,-.18),2.2,1.7,.009,p)" : "0."};
          float longSwell=w1+w2+w3+w4+w5;
          displaced.z += longSwell * waveStrength;
          waveCrest=smoothstep(.055,.17,longSwell*waveStrength);
          vec4 world= modelMatrix*vec4(displaced,1.);
          projected=textureMatrix*vec4(displaced,1.);
          worldPoint=world.xyz;
          vec4 mvPosition=modelViewMatrix*vec4(displaced,1.);
          gl_Position=projectionMatrix*mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: `
        uniform sampler2D tDiffuse, normalMap, depthMap;
        uniform float time, texel, normalStrength, reflectionStrength, refractionStrength, depthAbsorb, baseAlpha, reflectivity;
        uniform vec3 shallow, mid, deep, skyTint, sun;
        varying vec4 projected; varying vec3 worldPoint; varying float waveCrest;
        #include <common>
        #include <fog_pars_fragment>
        void main(){
          vec2 flowA=worldPoint.xz*.115+vec2(time*.018,time*.006);
          vec2 flowB=mat2(.62,-.78,.78,.62)*worldPoint.xz*.255+vec2(-time*.011,time*.017);
          vec2 flowC=worldPoint.zx*.62+vec2(time*.031,-time*.021);
          vec3 a=${waterConfig.normalLayers > 0 ? "texture2D(normalMap,flowA).xyz*2.-1." : "vec3(0.)"};
          ${normalLayers}
          vec3 n=normalize(vec3((a.x*.7+b.y*.55+c.x*.18)*.145*normalStrength,1.,(a.y*.68+b.x*.52+c.y*.16)*.145*normalStrength));
          vec3 view=normalize(cameraPosition-worldPoint);
          float fresnel=.02+.98*pow(1.-max(dot(view,n),0.),5.);
          ${reflectionSample}
          float floorY=${SEABED_Y.toFixed(2)}+texture2D(depthMap,(worldPoint.xz-vec2(-45.,-65.))/90.).r*8.;
          if(floorY>worldPoint.y+.025)discard;
          ${realm ? "if(abs(worldPoint.x)<3.15 || length(worldPoint.xz-vec2(0.,8.))<10.1)discard;" : ""}
          ${forest ? "if(abs(worldPoint.x)>43. || worldPoint.z < -63. || worldPoint.z > 23.)discard;" : ""}
          float depth=max(0.,worldPoint.y-floorY);
          float absorption=1.-exp(-depth*depthAbsorb);
          vec3 depthColor=mix(shallow,mid,smoothstep(.0,.42,absorption));
          depthColor=mix(depthColor,deep,smoothstep(.38,1.,absorption));
          float lambert=.68+.32*max(dot(n,normalize(sun)),0.);
          vec3 body=depthColor*lambert;
          float glint=pow(max(dot(normalize(sun+view),n),0.),${realm ? "120." : "180."})*${realm ? ".08" : ".22"};
          ${foam}
          vec3 color=mix(body,reflection,clamp(fresnel*(.62+.28*reflectionStrength)*reflectivity,0.,.92))+vec3(1.,.9,.68)*glint;
          color=mix(color,vec3(.74,.82,.78),foam);
          float alpha=clamp(baseAlpha+absorption*.6+fresnel*.5*reflectivity+shore*.04,0.,.96);
          gl_FragColor=vec4(color,alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`,
      uniforms: {
        textureMatrix: { value: new THREE.Matrix4() },
        normalMap: { value: normal },
        depthMap: { value: bathymetry },
        time: { value: 0 },
        sun: { value: realm ? new THREE.Vector3(35, 65, 48).normalize() : SUN_DIRECTION },
        shallow: { value: new THREE.Color(realm ? "#4DB5C8" : forest ? "#587365" : "#496c68") },
        deep: { value: new THREE.Color(realm ? "#0B5E78" : forest ? "#182e29" : "#162b2f") },
        mid: { value: new THREE.Color(realm ? "#178FA8" : forest ? "#314e43" : "#315d61") },
        skyTint: { value: new THREE.Color(realm ? "#9fc6dc" : forest ? "#72887e" : "#9db7c1") },
        texel: { value: 1 / Math.max(1, waterConfig.resolution) },
        waveStrength: { value: waterConfig.waveStrength * (realm ? .08 : forest ? .18 : 1) },
        normalStrength: { value: waterConfig.normalStrength * (realm ? .35 : 1) },
        reflectionStrength: { value: waterConfig.reflectionEnabled ? 1 : 0 },
        refractionStrength: { value: waterConfig.refractionStrength },
        depthAbsorb: { value: realm ? 2.6 : 1.22 },
        baseAlpha: { value: realm ? .34 : .13 },
        reflectivity: { value: realm ? .42 : 1 },
        ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      },
    });
    return { material: mat, timeUniform: mat.uniforms.time };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waterConfig.reflectionEnabled, waterConfig.waveLayers, waterConfig.normalLayers, waterConfig.foamEnabled, realm, forest, normals, bathymetry, waterConfig.resolution]);

  // ── Reflector / water mesh: only recreated when resolution changes ──
  const water = useMemo(() => {
    const geo = new THREE.PlaneGeometry(realm ? 36 : 160, realm ? 32 : 160, waterConfig.segments, waterConfig.segments);
    const obj = waterConfig.reflectionEnabled
      ? new Reflector(geo, { textureWidth: waterConfig.resolution, textureHeight: waterConfig.resolution, clipBias: .003, multisample: 0 })
      : new THREE.Mesh(geo, material);
    obj.name = realm ? "ascension-courtyard-water" : forest ? "forest-stream" : "shallow-coastal-water";
    obj.rotation.x = -Math.PI / 2;
    obj.position.set(0, realm ? -.12 : forest ? -.48 : SEA_LEVEL, realm ? -14 : -25);
    if (waterConfig.reflectionEnabled) obj.onBeforeRender = reflectionUpdater(obj as Reflector, true, waterConfig.cadence);
    return obj;
  }, [waterConfig.reflectionEnabled, waterConfig.resolution, waterConfig.segments, waterConfig.cadence, material, realm, forest]);

  // ── Cleanup ──
  useEffect(() => () => {
    const mat = water.material as THREE.ShaderMaterial;
    if (mat.uniforms?.normalMap?.value) mat.uniforms.normalMap.value.dispose();
    if (water instanceof Reflector) water.dispose();
    else water.material.dispose();
    water.geometry.dispose();
  }, [water]);

  // ── Update uniforms when config values change (no material/geometry rebuild) ──
  useEffect(() => {
    const mat = water.material as THREE.ShaderMaterial;
    if (!mat?.uniforms) return;
    const u = mat.uniforms;
    applyProps(u.waveStrength, { value: waterConfig.waveStrength * (realm ? .08 : forest ? .18 : 1) });
    applyProps(u.normalStrength, { value: waterConfig.normalStrength * (realm ? .35 : 1) });
    applyProps(u.reflectionStrength, { value: waterConfig.reflectionEnabled ? 1 : 0 });
    applyProps(u.refractionStrength, { value: waterConfig.refractionStrength });
    applyProps(u.texel, { value: 1 / Math.max(1, waterConfig.resolution) });
  }, [water, waterConfig.waveStrength, waterConfig.normalStrength, waterConfig.reflectionEnabled, waterConfig.refractionStrength, waterConfig.resolution, realm, forest]);

  // ── Animation loop ──
  useFrame(({ gl }, delta) => {
    applyProps(water.userData, { frame: (water.userData.frame ?? 0) + 1 });
    if (!reduced) applyProps(timeUniform, { value: timeUniform.value + Math.min(delta, .05) });
    if (process.env.NODE_ENV === "development" && water.userData.frame % 60 === 0) {
      gl.domElement.dataset.waterState = JSON.stringify({
        time: timeUniform.value,
        resolution: waterConfig.reflectionEnabled ? (water as Reflector).getRenderTarget().width : 0,
        reflections: water.userData.reflectionUpdates ?? 0,
        segments: waterConfig.segments,
        realtimeReflection: waterConfig.reflectionEnabled,
        detail: waterConfig.detailEnabled,
        normalLayers: waterConfig.normalLayers,
        waveLayers: waterConfig.waveLayers,
        foam: waterConfig.foamEnabled,
      });
    }
  });

  return <primitive object={water} dispose={null} />;
}
