"use client";
import { createContext, useMemo, type ReactNode } from "react";
import { applyProps, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "../useReducedMotion";
export const ForestWindContext = createContext<{ value: number } | null>(null);
export function ForestWind({ children }: { children: ReactNode }) {
  const time = useMemo(() => ({ value: 0 }), []);
  const reduced = useReducedMotion();
  useFrame(({ gl }, delta) => {
    if (!reduced) applyProps(time, { value: time.value + Math.min(delta, .05) });
    if (process.env.NODE_ENV === "development") gl.domElement.dataset.forestWind = time.value.toFixed(2);
  });
  return <ForestWindContext.Provider value={time}>{children}</ForestWindContext.Provider>;
}
