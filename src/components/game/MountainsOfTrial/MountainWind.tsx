"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGraphicsQuality } from "../GraphicsQuality";
import { MOUNTAIN_WIND } from "./mountainConfig";

export default function MountainWind({ children }: { children: React.ReactNode }) {
  const windRef = useRef({ value: 0 });
  const { preset } = useGraphicsQuality();

  useFrame((_, delta) => {
    windRef.current.value += delta * MOUNTAIN_WIND.baseSpeed * 0.01;
  });

  return (
    <group>
      {children}
    </group>
  );
}
