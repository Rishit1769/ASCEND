"use client";
import { createContext, useContext } from "react";

export type GraphicsQuality = "high" | "medium" | "low";
export const GraphicsContext = createContext<GraphicsQuality>("high");
export const useGraphicsQuality = () => useContext(GraphicsContext);

export function initialGraphicsQuality(): GraphicsQuality {
  if (typeof window === "undefined") return "medium";
  try {
    const saved = localStorage.getItem("ascend-graphics");
    if (saved === "high" || saved === "medium" || saved === "low") return saved;
  } catch { /* Storage may be unavailable in private browsing. */ }
  return window.innerWidth >= 768 && navigator.hardwareConcurrency >= 4 ? "high" : "medium";
}
