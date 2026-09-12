"use client";

function Pillar({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.65, 0]} castShadow>
        <boxGeometry args={[0.42, 1.3, 0.42]} />
        <meshStandardMaterial color="#1C2128" roughness={0.92} flatShading />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <boxGeometry args={[0.7, 0.18, 0.7]} />
        <meshStandardMaterial color="#374554" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

function DeadTree({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.7, 0]} rotation={[0, 0, -0.12]} castShadow>
        <cylinderGeometry args={[0.13, 0.22, 1.7, 6]} />
        <meshStandardMaterial color="#24201f" roughness={1} flatShading />
      </mesh>
      <mesh position={[-0.28, 1.45, 0]} rotation={[0, 0, -0.62]}>
        <cylinderGeometry args={[0.055, 0.09, 0.9, 5]} />
        <meshStandardMaterial color="#24201f" roughness={1} flatShading />
      </mesh>
      <mesh position={[0.27, 1.62, 0]} rotation={[0, 0, 0.55]}>
        <cylinderGeometry args={[0.05, 0.08, 0.8, 5]} />
        <meshStandardMaterial color="#24201f" roughness={1} flatShading />
      </mesh>
    </group>
  );
}

export default function Ruins() {
  return (
    <group name="forgotten-shore-ruins">
      <Pillar position={[-3.5, -1.05, -4.4]} rotation={[0.04, 0.2, -0.08]} />
      <Pillar position={[3.35, -1.05, -4.8]} rotation={[-0.06, -0.3, 0.04]} />
      <mesh position={[0, -0.72, -5.5]} rotation={[0.02, 0.08, 0.02]} castShadow>
        <boxGeometry args={[3.8, 0.36, 0.48]} />
        <meshStandardMaterial color="#1C2128" roughness={0.98} flatShading />
      </mesh>
      <mesh position={[-1.6, -0.55, -5.45]} rotation={[0.02, 0.08, -0.04]}>
        <boxGeometry args={[0.36, 1.15, 0.42]} />
        <meshStandardMaterial color="#303A46" roughness={0.95} flatShading />
      </mesh>
      <DeadTree position={[-5.1, -1.05, -3.9]} rotation={[0, 0.2, -0.04]} />
      <DeadTree position={[4.75, -1.05, -4.4]} rotation={[0, -0.4, 0.05]} />
    </group>
  );
}
