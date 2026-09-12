"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { normalizeLevel, resolveWorld } from "@/lib/world";

type WorldContextValue = { level: number; preview: boolean; previewLevel: number | null; reloadCounter: number; previewAnimation: string; setPreviewLevel: (level: number) => void; exitPreview: () => void; reloadRegion: () => void; setPreviewAnimation: (animation: string) => void };
const WorldContext = createContext<WorldContextValue>({ level: 1, preview: false, previewLevel: null, reloadCounter: 0, previewAnimation: "FIGHTIDLE_Root", setPreviewLevel: () => {}, exitPreview: () => {}, reloadRegion: () => {}, setPreviewAnimation: () => {} });
export const useWorldProgress = () => useContext(WorldContext);

const DEV_REALMS = [
  { id: "forgotten-shore" as const, name: "The Forgotten Shore" },
  { id: "forest-of-resolve" as const, name: "Forest of Resolve" },
];

export function WorldProgressProvider({ level, children }: { level: number; children: ReactNode }) {
  const [previewLevel, setPreviewLevel] = useState<number | null>(null);
  const [reloadCounter, setReloadCounter] = useState(0);
  const [previewAnimation, setPreviewAnimation] = useState("FIGHTIDLE_Root");
  const enablePreview = useCallback((next: number) => { setPreviewLevel(normalizeLevel(next)); }, []);
  const exitPreview = useCallback(() => { setPreviewLevel(null); }, []);
  const effective = process.env.NODE_ENV === "development" && previewLevel !== null ? previewLevel : normalizeLevel(level);
  return <WorldContext.Provider value={{ level: effective, preview: previewLevel !== null, previewLevel, reloadCounter, previewAnimation, setPreviewLevel: enablePreview, exitPreview, reloadRegion: () => setReloadCounter(value => value + 1), setPreviewAnimation }}>
    {children}
    {process.env.NODE_ENV === "development" && <WorldPreviewPanel />}
  </WorldContext.Provider>;
}

function WorldPreviewPanel() {
  const { level, preview, setPreviewLevel, exitPreview, reloadRegion, previewAnimation, setPreviewAnimation } = useWorldProgress();
  const [open, setOpen] = useState(false);
  const { region } = resolveWorld(level);

  return <div className="pointer-events-auto absolute right-3 bottom-20 z-50 w-[min(330px,calc(100vw-24px))] text-xs text-white sm:bottom-3">
    <button className="rounded border border-amber-200/40 bg-black/85 px-3 py-2 font-semibold uppercase tracking-wider" onClick={() => setOpen(value => !value)} aria-expanded={open}>DEV MODE</button>
    {preview && <span className="ml-2 rounded bg-amber-200 px-2 py-1 text-[10px] font-bold text-black">ACTIVE</span>}
    {open && <section className="mt-2 max-h-[72vh] overflow-auto rounded border border-white/20 bg-black/90 p-3 shadow-2xl" aria-label="Developer mode panel">
      <div className="mb-3 flex items-center justify-between"><strong>Developer Mode</strong><span className="text-white/60">{region.name}</span></div>

      <p className="mb-2 text-[10px] uppercase tracking-wider text-white/50">Select Map</p>
      <div className="mb-3 flex flex-col gap-2">
        {DEV_REALMS.map(realm => {
          const isActive = region.id === realm.id;
          return <button
            key={realm.id}
            className={`w-full rounded border px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              isActive
                ? "border-amber-300/50 bg-amber-200/10 text-amber-200"
                : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
            onClick={() => setPreviewLevel(realm.id === "forgotten-shore" ? 1 : 6)}
          >
            {realm.name}
            {isActive && <span className="ml-2 text-[9px] font-normal opacity-60">CURRENT</span>}
          </button>;
        })}
      </div>

      <label className="mb-3 block text-white/60">Level
        <select
          className="mt-1 w-full bg-zinc-900 p-2 text-white"
          aria-label="Preview level"
          value={level}
          onChange={event => setPreviewLevel(Number(event.target.value))}
        >
          {[1,2,3,4,5,6,7,8,9,10].map(l => {
            const r = resolveWorld(l);
            return <option key={l} value={l}>{l} — {r.region.name}</option>;
          })}
        </select>
      </label>

      <label className="mb-3 block text-white/60">Animation<select className="mt-1 w-full bg-zinc-900 p-2 text-white" aria-label="Preview animation" value={previewAnimation} onChange={event => setPreviewAnimation(event.target.value)}><option>FIGHTIDLE_Root</option><option>WALK_player_Root</option></select></label>
      <label className="mb-3 block text-white/60">Graphics preset<select className="mt-1 w-full bg-zinc-900 p-2 text-white" aria-label="Preview graphics preset" defaultValue="auto" onChange={event => window.dispatchEvent(new CustomEvent("ascend-preview-preset", { detail: event.target.value }))}><option value="auto">AUTO</option><option value="ultra">ULTRA</option><option value="high">HIGH</option><option value="medium">MEDIUM</option><option value="low">LOW</option><option value="potato">POTATO</option></select></label>

      <div className="grid grid-cols-2 gap-2"><button className="border border-white/20 px-2 py-2" onClick={reloadRegion}>Reload region</button><button className="border border-white/20 px-2 py-2" onClick={() => { setOpen(false); window.dispatchEvent(new Event("ascend-reset-camera")); }}>Reset camera</button></div>

      {preview && <button className="mt-3 w-full rounded border border-white/20 bg-white/5 px-2 py-2 text-[11px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white" onClick={() => { exitPreview(); setOpen(false); }}>Exit preview</button>}
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
