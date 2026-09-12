"use client";

import { useMemo } from "react";
import * as THREE from "three";

function createTerrainGeometry() {
  const geometry = new THREE.PlaneGeometry(18, 15, 8, 7);
  const positions = geometry.attributes.position;

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const ridge = Math.sin(x * 0.8) * 0.035 + Math.cos(y * 1.1) * 0.025;
    const centerDip = Math.max(0, 1 - Math.abs(x) / 5) * 0.02;
    positions.setZ(index, ridge - centerDip);
  }

  geometry.computeVertexNormals();
  return geometry;
}

export default function Terrain() {
  const geometry = useMemo(() => createTerrainGeometry(), []);

  return (
    <group name="forgotten-shore-terrain">
      <mesh
        geometry={geometry}
        position={[0, -1.13, -1.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#1B1E22" roughness={0.96} metalness={0.04} flatShading />
      </mesh>

      <mesh position={[0, -1.075, -3.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.55, 4.4]} />
        <meshStandardMaterial color="#18130F" roughness={0.86} metalness={0.02} transparent opacity={0.58} />
      </mesh>

      <mesh position={[-1.8, -1.075, -1.8]} rotation={[-Math.PI / 2, 0.1, 0]}>
        <planeGeometry args={[2.2, 0.9]} />
        <meshStandardMaterial
          color="#273039"
          roughness={0.18}
          metalness={0.18}
          transparent
          opacity={0.42}
        />
      </mesh>
      <mesh position={[2.2, -1.075, -2.8]} rotation={[-Math.PI / 2, -0.2, 0]}>
        <planeGeometry args={[1.6, 0.65]} />
        <meshStandardMaterial
          color="#222c34"
          roughness={0.2}
          metalness={0.16}
          transparent
          opacity={0.38}
        />
      </mesh>
    </group>
  );
}
