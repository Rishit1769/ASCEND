"use client";

export default function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.3} color="#c0c0e0" />
      <directionalLight
        position={[3, 5, 4]}
        intensity={0.8}
        color="#e8e0d0"
        castShadow={false}
      />
      <pointLight
        position={[-2, 2, 3]}
        intensity={0.3}
        color="#d4a543"
        distance={10}
        decay={2}
      />
      <pointLight
        position={[0, 0.5, 4]}
        intensity={0.15}
        color="#ffffff"
        distance={8}
        decay={2}
      />
    </>
  );
}
