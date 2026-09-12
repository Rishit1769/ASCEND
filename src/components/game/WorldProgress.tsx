"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { normalizeLevel, resolveWorld, WORLD_CHECKPOINTS } from "@/lib/world";

const WorldContext = createContext({ level: 1, preview: false });
export const useWorldProgress = () => useContext(WorldContext);

// Account level is supplied by the caller; previews never write player data or storage.
export function WorldProgressProvider({ level, children }: { level: number; children: ReactNode }) {
  const [previewLevel, setPreviewLevel] = useState<number | null>(null);
  const effective = process.env.NODE_ENV === "development" && previewLevel !== null ? previewLevel : normalizeLevel(level);
  return <WorldContext.Provider value={{ level: effective, preview: previewLevel !== null }}>
    {children}
    {process.env.NODE_ENV === "development" && <label className="absolute right-3 bottom-40 sm:bottom-auto sm:top-32 z-30 text-xs text-white bg-black/75 p-2 rounded">
      World preview <select aria-label="Preview world level" className="max-w-44 bg-black p-1" value={previewLevel ?? "account"} onChange={event => setPreviewLevel(event.target.value === "account" ? null : Number(event.target.value))}>
        <option value="account">Player level ({level})</option>
        {WORLD_CHECKPOINTS.map(point => <option key={point.id} value={point.level}>{point.level}: {point.name}</option>)}
      </select>
    </label>}
  </WorldContext.Provider>;
}

export function WorldLocation() {
  const { level, preview } = useWorldProgress();
  const { region, checkpoint } = resolveWorld(level);
  return <div className="pointer-events-none absolute inset-x-16 top-24 text-center text-white/90 sm:top-20" aria-live="polite">
    <p className="text-xs uppercase">{region.name}</p>
    <p className="text-[11px] text-white/65">Level {level} · {checkpoint.name}{preview ? " · Preview" : ""}</p>
  </div>;
}
