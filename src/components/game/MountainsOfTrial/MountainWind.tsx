"use client";
import { createContext, useMemo, type ReactNode } from "react";
import { applyProps, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "../useReducedMotion";
import { MOUNTAIN } from "./mountainConfig";

export const MountainWindContext = createContext<{ value: number } | null>(null);

export default function MountainWind({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const time = useMemo(() => ({ value: 0 }), []);
  useFrame(({ gl }, delta) => {
    if (!reduced) applyProps(time, { value: time.value + Math.min(delta, .05) * MOUNTAIN.wind.baseSpeed });
    if (process.env.NODE_ENV === "development") gl.domElement.dataset.mountainWind = time.value.toFixed(2);
  });
  return <MountainWindContext.Provider value={time}>{children}</MountainWindContext.Provider>;
}
