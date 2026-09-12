// Original procedural material detail. Scan atlases retain their authored UVs;
// this world-space layer blends all three projections on vertical surfaces.
export const TERRAIN_DETAIL_GLSL = `
float terrainHash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float terrainNoise(vec2 p) {
  vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(terrainHash(i),terrainHash(i+vec2(1,0)),f.x),mix(terrainHash(i+vec2(0,1)),terrainHash(i+vec2(1,1)),f.x),f.y);
}
float terrainTri(vec3 p, vec3 w) {
  return terrainNoise(p.yz)*w.x + terrainNoise(p.zx)*w.y + terrainNoise(p.xy)*w.z;
}
`;

export const TERRAIN_COLOR_GLSL = `
vec3 terrainFace = normalize(cross(dFdx(artPosition),dFdy(artPosition)));
vec3 terrainWeights = pow(abs(terrainFace),vec3(4.));
terrainWeights /= max(dot(terrainWeights,vec3(1.)),.0001);
float terrainSlope = 1.-abs(terrainFace.y);
float terrainMacro = terrainTri(artPosition*.32,terrainWeights);
float terrainMeso = terrainTri(artPosition*4.1,terrainWeights);
float terrainMicro = terrainTri(artPosition*72.,terrainWeights);
float terrainDetailFade = 1.-smoothstep(8.,32.,length(vViewPosition));
float soilWeight = (1.-smoothstep(.18,.62,terrainSlope))*smoothstep(.38,.78,terrainMeso);
float mossWeight = soilWeight*smoothstep(.48,.8,terrainMacro)*smoothstep(-1.5,-.8,artPosition.y);
diffuseColor.rgb *= .88 + terrainMacro*.23;
diffuseColor.rgb *= 1.+(terrainMicro-.5)*.22*terrainDetailFade;
diffuseColor.rgb = mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.12,.99,.78),soilWeight*.3);
diffuseColor.rgb = mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.7,1.08,.74),mossWeight*.4);
`;

export const TERRAIN_NORMAL_GLSL = `
float detailHeight = terrainMicro * .014 * terrainDetailFade;
vec3 surfaceDx = dFdx(-vViewPosition), surfaceDy = dFdy(-vViewPosition);
vec3 gradientX = cross(surfaceDy,normal), gradientY = cross(normal,surfaceDx);
float determinant = dot(surfaceDx,gradientX);
vec3 surfaceGradient = sign(determinant)*(dFdx(detailHeight)*gradientX+dFdy(detailHeight)*gradientY);
normal = normalize(abs(determinant)*normal-surfaceGradient);
`;
