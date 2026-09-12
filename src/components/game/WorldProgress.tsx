"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { normalizeLevel, resolveWorld, WORLD_CHECKPOINTS, WORLD_REGIONS } from "@/lib/world";

type WorldContextValue = { level: number; preview: boolean; previewLevel: number | null; reloadCounter: number; previewAnimation: string; setPreviewLevel: (level: number) => void; exitPreview: () => void; reloadRegion: () => void; setPreviewAnimation: (animation: string) => void };
const WorldContext = createContext<WorldContextValue>({ level: 1, preview: false, previewLevel: null, reloadCounter: 0, previewAnimation: "FIGHTIDLE_Root", setPreviewLevel: () => {}, exitPreview: () => {}, reloadRegion: () => {}, setPreviewAnimation: () => {} });
export const useWorldProgress = () => useContext(WorldContext);

// Account level is supplied by the caller; previews never write player data or storage.
export function WorldProgressProvider({ level, children }: { level: number; children: ReactNode }) {
  const [previewLevel, setPreviewLevel] = useState<number | null>(null);
  const [reloadCounter, setReloadCounter] = useState(0);
  const [previewAnimation, setPreviewAnimation] = useState("FIGHTIDLE_Root");
  const enablePreview = (next: number) => { setPreviewLevel(normalizeLevel(next)); console.info("[WorldPreview] Selected level:", normalizeLevel(next)); };
  const exitPreview = () => { setPreviewLevel(null); console.info("[WorldPreview] Exited; restored player level:", level); };
  const effective = process.env.NODE_ENV === "development" && previewLevel !== null ? previewLevel : normalizeLevel(level);
  return <WorldContext.Provider value={{ level: effective, preview: previewLevel !== null, previewLevel, reloadCounter, previewAnimation, setPreviewLevel: enablePreview, exitPreview, reloadRegion: () => setReloadCounter(value => value + 1), setPreviewAnimation }}>
    {children}
    {process.env.NODE_ENV === "development" && <WorldPreviewPanel actualLevel={level} />}
  </WorldContext.Provider>;
}

function WorldPreviewPanel({ actualLevel }: { actualLevel: number }) {
  const { level, preview, previewLevel, setPreviewLevel, exitPreview, reloadRegion, previewAnimation, setPreviewAnimation } = useWorldProgress();
  const [open, setOpen] = useState(false);
  const { region, checkpoint } = resolveWorld(level);
  return <div className="pointer-events-auto absolute right-3 bottom-20 z-50 w-[min(330px,calc(100vw-24px))] text-xs text-white sm:bottom-3">
    <button className="rounded border border-amber-200/40 bg-black/85 px-3 py-2 font-semibold uppercase tracking-wider" onClick={() => setOpen(value => !value)} aria-expanded={open}>PREVIEW WORLD</button>
    {preview && <span className="ml-2 rounded bg-amber-200 px-2 py-1 text-[10px] font-bold text-black">DEV WORLD PREVIEW</span>}
    {open && <section className="mt-2 max-h-[72vh] overflow-auto rounded border border-white/20 bg-black/90 p-3 shadow-2xl" aria-label="World preview panel">
      <div className="mb-3 flex items-center justify-between"><strong>World Preview</strong><span className="text-white/60">{region.name}</span></div>
      <label className="mb-2 block text-white/60">Region<select className="mt-1 w-full bg-zinc-900 p-2 text-white" aria-label="Preview region" value={region.id} onChange={event => { const target = WORLD_REGIONS.find(item => item.id === event.target.value); if (target) setPreviewLevel(target.levelStart); }}>
        {WORLD_REGIONS.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></label>
      <label className="mb-2 block text-white/60">Checkpoint<select className="mt-1 w-full bg-zinc-900 p-2 text-white" aria-label="Preview checkpoint" value={level} onChange={event => setPreviewLevel(Number(event.target.value))}>
        {WORLD_CHECKPOINTS.map(item => <option key={item.id} value={item.level}>{item.level}: {item.name}</option>)}
      </select></label>
      <p className="mb-2 text-white/70">Resolved: Level {level} · {checkpoint.name}</p>
      <div className="mb-3 grid grid-cols-2 gap-1">{WORLD_REGIONS.map(item => <button key={item.id} className="border border-white/15 bg-white/5 px-2 py-1 text-left hover:bg-white/15" onClick={() => setPreviewLevel(item.levelStart)}>{item.name}</button>)}</div>
      <label className="mb-3 block text-white/60">Animation<select className="mt-1 w-full bg-zinc-900 p-2 text-white" aria-label="Preview animation" value={previewAnimation} onChange={event => setPreviewAnimation(event.target.value)}><option>FIGHTIDLE_Root</option><option>WALK_player_Root</option></select></label>
      <label className="mb-3 block text-white/60">Graphics preset<select className="mt-1 w-full bg-zinc-900 p-2 text-white" aria-label="Preview graphics preset" defaultValue="auto" onChange={event => window.dispatchEvent(new CustomEvent("ascend-preview-preset", { detail: event.target.value }))}><option value="auto">AUTO</option><option value="ultra">ULTRA</option><option value="high">HIGH</option><option value="medium">MEDIUM</option><option value="low">LOW</option><option value="potato">POTATO</option></select></label>
      <div className="grid grid-cols-2 gap-2"><button className="border border-white/20 px-2 py-2" onClick={reloadRegion}>Reload region</button><button className="border border-white/20 px-2 py-2" onClick={() => { setOpen(false); window.dispatchEvent(new Event("ascend-reset-camera")); }}>Reset camera</button></div>
      <p className="mt-3 border-t border-white/15 pt-2 text-[10px] text-white/55">Status: {region.status === "available" ? "READY" : "PLACEHOLDER"}<br />Actual player level: {actualLevel}</p>
      {preview && <button className="mt-2 w-full bg-amber-200 px-2 py-2 font-semibold text-black" onClick={() => { exitPreview(); setOpen(false); }}>Exit preview</button>}
      {previewLevel === null && <p className="mt-2 text-[10px] text-white/50">Select a region or checkpoint to enable preview.</p>}
    </section>}
  </div>;
}

export function WorldLocation() {
  const { level, preview } = useWorldProgress();
  const { region, checkpoint } = resolveWorld(level);
  return <div className="pointer-events-none absolute inset-x-16 top-24 text-center text-white/90 sm:top-20" aria-live="polite">
    <p className="text-xs uppercase">{region.name}</p>
    <p className="text-[11px] text-white/65">Level {level} · {checkpoint.name}{preview ? " · Preview" : ""}</p>
  </div>;
}
