"use client";
import { useEffect, useMemo } from "react";
import { Color, RepeatWrapping, SRGBColorSpace, NoColorSpace } from "three";
import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useGraphicsQuality } from "../GraphicsQuality";
import { useWorldProgress } from "../WorldProgress";
import { createMountainGeometry, MOUNTAIN_QUALITY } from "./mountainConfig";

export { createMountainGeometry } from "./mountainConfig";

export default function MountainTerrain() {
  const { preset } = useGraphicsQuality();
  const { level } = useWorldProgress();
  const gl = useThree(state => state.gl);
  const quality = MOUNTAIN_QUALITY[preset];
  const textures = useTexture(["/environment/forest-floor-Diffuse.jpg", "/environment/forest-floor-nor_gl.jpg", "/environment/forest-floor-Rough.jpg"]);
  const geometry = useMemo(() => createMountainGeometry(quality.segments), [quality.segments]);
  const maps = useMemo(() => {
    const [color, normal, roughness] = textures.map(texture => texture.clone());
    color.colorSpace = SRGBColorSpace;
    normal.colorSpace = NoColorSpace;
    roughness.colorSpace = NoColorSpace;
    for (const texture of [color, normal, roughness]) {
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.repeat.set(46, 54);
      texture.anisotropy = Math.min(quality.anisotropy, gl.capabilities.getMaxAnisotropy());
      texture.needsUpdate = true;
    }
    return { color, normal, roughness };
  }, [textures, quality.anisotropy, gl]);
  useEffect(() => () => {
    geometry.dispose();
    maps.color.dispose();
    maps.normal.dispose();
    maps.roughness.dispose();
  }, [geometry, maps]);

  return <mesh geometry={geometry} receiveShadow name="mountain-trail-terrain">
    <meshStandardMaterial
      map={maps.color}
      normalMap={preset === "potato" ? null : maps.normal}
      roughnessMap={maps.roughness}
      color="#a9ada4"
      roughness={.88}
      metalness={0}
      onBeforeCompile={shader => {
        shader.uniforms.checkpointLevel = { value: level };
        shader.uniforms.mossColor = { value: new Color("#354838") };
        shader.uniforms.rockColor = { value: new Color("#636d70") };
        shader.uniforms.snowColor = { value: new Color("#d9e1e3") };
          shader.uniforms.iceColor = { value: new Color("#8fa8b4") };
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", "#include <common>\nvarying vec3 mountainPoint;varying vec3 mountainNormal;")
          .replace("#include <beginnormal_vertex>", "#include <beginnormal_vertex>\nmountainNormal = normalize(normalMatrix * objectNormal);")
          .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nmountainPoint = worldPosition.xyz;");
        shader.fragmentShader = shader.fragmentShader
          .replace("#include <common>", "#include <common>\nvarying vec3 mountainPoint;varying vec3 mountainNormal;uniform float checkpointLevel;uniform vec3 mossColor;uniform vec3 rockColor;uniform vec3 snowColor;uniform vec3 iceColor;")
          .replace("#include <map_fragment>", `
            vec3 triWeights = pow(abs(normalize(mountainNormal)), vec3(4.0));
            triWeights /= max(dot(triWeights, vec3(1.0)), 0.0001);
            vec2 triScale = mountainPoint.xz * .42;
            vec3 triX = texture2D(map, mountainPoint.yz * .42).rgb;
            vec3 triY = texture2D(map, triScale).rgb;
            vec3 triZ = texture2D(map, mountainPoint.xy * .42).rgb;
            vec3 triAlbedo = triX * triWeights.x + triY * triWeights.y + triZ * triWeights.z;
            diffuseColor *= vec4(triAlbedo, 1.0);
          `)
          .replace("#include <color_fragment>", `#include <color_fragment>
            float altitude = smoothstep(2.0, 22.0, mountainPoint.y);
            float up = clamp(mountainNormal.y, 0.0, 1.0);
            float steep = 1.0 - smoothstep(.42, .78, up);
            float path = 1.0 - smoothstep(1.2, 5.6, abs(mountainPoint.x - (sin((mountainPoint.z+8.)*.115)*4.6 + sin((mountainPoint.z+31.)*.037)*2.4)));
            float levelRock = smoothstep(11.5, 13.5, checkpointLevel);
            float levelSnow = smoothstep(13.2, 15.0, checkpointLevel);
            vec2 cell = floor(mountainPoint.xz * 28.0);
            float grit = fract(sin(dot(cell, vec2(12.9898,78.233))) * 43758.5453);
            float strata = sin(mountainPoint.x * 1.7 + mountainPoint.z * .38) * sin(mountainPoint.z * 2.3 - mountainPoint.x * .24);
            float gravel = fract(sin(dot(floor(mountainPoint.xz * 74.0), vec2(41.17, 97.31))) * 19347.19);
            float runoff = smoothstep(.2, .9, sin(mountainPoint.x * .34 + mountainPoint.z * .08) * .5 + .5) * (1.0 - up) * smoothstep(10.0, 20.0, mountainPoint.y);
            float moisture = smoothstep(.1, .8, 1.0 - abs(sin(mountainPoint.x * .12 + mountainPoint.z * .19))) * (1.0 - altitude * .55);
            float moss = (1.0 - altitude) * smoothstep(.48, .9, up) * (1.0 - path*.42) * (1.0 - levelRock*.48);
            float snow = max(levelSnow * .35, smoothstep(.38, .95, altitude)) * smoothstep(.52, .95, up);
            snow *= smoothstep(.2, .95, sin(mountainPoint.x*.73 + mountainPoint.z*.47) * .5 + .5);
            snow *= 1.0 - smoothstep(.68, .98, steep) * .72;
            float ice = smoothstep(.72, 1.0, altitude) * smoothstep(.55, .82, up) * smoothstep(.42, .78, grit);
            diffuseColor.rgb = mix(diffuseColor.rgb, rockColor, .52 + steep*.34);
            diffuseColor.rgb = mix(diffuseColor.rgb, mossColor, moss*.6);
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.42,.39,.34), path*.48*(1.0-snow));
            diffuseColor.rgb = mix(diffuseColor.rgb, snowColor, snow*.78);
            diffuseColor.rgb = mix(diffuseColor.rgb, iceColor, ice*.22);
            diffuseColor.rgb *= mix(.86,1.1,grit);
            diffuseColor.rgb *= 1.0 + strata * (.035 + steep*.035);
            diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(.72,.75,.73), smoothstep(.72,.98,gravel) * steep*.16);`)
          .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
            float highWet = smoothstep(8.0, 19.0, mountainPoint.y) * smoothstep(.55,.85,mountainNormal.y);
            float surfaceBreakup = fract(sin(dot(floor(mountainPoint.xz * 38.0), vec2(17.13, 53.71))) * 241.37);
            float wetRock = clamp(moisture * .34 + runoff * .22 + highWet * .18, 0.0, .56);
            float snowRoughness = smoothstep(.2, .8, snow) * .16;
            float iceRoughness = smoothstep(.45, .9, ice) * .42;
            roughnessFactor = clamp(roughnessFactor + (surfaceBreakup - .5) * .16 + snowRoughness - wetRock - iceRoughness, .3, 1.0);
            roughnessFactor = mix(roughnessFactor, .68, highWet*.25);`);
      }}
      customProgramCacheKey={() => `mountain-terrain-v2-${preset}-${level}`}
    />
  </mesh>;
}
