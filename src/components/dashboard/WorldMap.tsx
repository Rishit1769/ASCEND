"use client";
import { useEffect, useRef, useState } from "react";
import { Crosshair, Minus, Plus, X, LockKeyhole, Flag } from "lucide-react";
import { WORLD_CHECKPOINTS, WORLD_REGIONS, resolveWorld, levelRange } from "@/lib/world";
import { useWorldProgress } from "../game/WorldProgress";
import "./world-map.css";

export default function WorldMap({ onClose }: { onClose: () => void }) {
  const { level } = useWorldProgress();
  const current = resolveWorld(level);
  const [selected, setSelected] = useState(current.checkpoint.level);
  const [zoom, setZoom] = useState(1);
  const viewport = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef(0);
  const info = resolveWorld(selected);
  const next = current.checkpoint.nextCheckpoint ? resolveWorld(current.checkpoint.nextCheckpoint) : null;
  const nextRegion = WORLD_REGIONS[WORLD_REGIONS.indexOf(current.region) + 1];
  const status = selected < level ? "Completed" : selected === current.checkpoint.level ? "Current location" : "Locked";
  function center(behavior: ScrollBehavior = "smooth") {
    const node = viewport.current?.querySelector<HTMLElement>(`[data-level="${current.checkpoint.level}"]`);
    const view = viewport.current;
    if (node && view) view.scrollTo({ left: node.offsetLeft - view.clientWidth / 2, top: node.offsetTop - view.clientHeight / 2, behavior });
  }
  useEffect(() => {
    const prior = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    return () => { prior?.focus(); };
  }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => center("instant"));
    const observer = new ResizeObserver(() => center("instant"));
    if (viewport.current) observer.observe(viewport.current);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
    // Center after the current marker or map scale changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, zoom]);

  return <dialog ref={dialog} className="world-map" aria-labelledby="map-title" onCancel={onClose}>
    <header className="map-header"><div><h2 id="map-title">Atlas of the Ascent</h2><p>{current.region.name} · Level {level}</p></div><button title="Close map" aria-label="Close map" onClick={onClose}><X size={20} /></button></header>
    <div className="map-body">
      <div className="map-viewport" ref={viewport}
        onWheel={event => { if (event.ctrlKey) { event.preventDefault(); setZoom(z => Math.max(.65, Math.min(2, z - event.deltaY * .002))); } }}
        onPointerDown={event => { if ((event.target as HTMLElement).closest("button")) return; pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY }); event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerMove={event => {
          const previous = pointers.current.get(event.pointerId);
          if (!previous || !viewport.current) return;
          pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
          if (pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()];
            const distance = Math.hypot(a.x - b.x, a.y - b.y);
            if (pinch.current) setZoom(z => Math.max(.65, Math.min(2, z * distance / pinch.current)));
            pinch.current = distance;
          } else { viewport.current.scrollLeft -= event.clientX - previous.x; viewport.current.scrollTop -= event.clientY - previous.y; }
        }}
        onPointerUp={event => { pointers.current.delete(event.pointerId); pinch.current = 0; }}
        onPointerCancel={event => { pointers.current.delete(event.pointerId); pinch.current = 0; }}>
        <div className="map-geography" style={{ width: 700 * zoom, height: 1530 * zoom }}>
          <svg viewBox="0 0 700 1530" className="map-cartography" aria-hidden="true">
            <defs><pattern id="atlas-grain" width="47" height="41" patternUnits="userSpaceOnUse"><path d="M2 7l5 1m17 21l8-2M10 38l3-1" stroke="#b1b5a0" strokeOpacity=".08" /></pattern></defs>
            <rect width="700" height="1530" fill="#1c2425" />
            <path d="M0 1400 Q100 1220 170 1300T285 1480L285 1530H0Z" fill="#304c55" />
            <path d="M0 1375Q100 1195 180 1270T310 1530M0 1345Q100 1165 195 1255" fill="none" stroke="#739099" strokeOpacity=".35" />
            {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M${80 + i * 31} ${910 - (i % 5) * 105}l-30 55 25-14 13 28 28-8-36-61`} fill="#313b3d" stroke="#6b7473" strokeOpacity=".3" />)}
            {Array.from({ length: 35 }, (_, i) => <path key={i} d={`M${70 + i % 10 * 53} ${1130 + Math.floor(i / 10) * 32}l-9 17h6l-10 12h26l-10-12h6Z`} fill="#384c40" stroke="#6c7e69" strokeOpacity=".3" />)}
            <path d="M90 415Q210 350 315 390T630 310M60 440Q170 400 300 440T640 370M100 240Q270 190 400 245T650 185" stroke="#c0c6c1" strokeOpacity=".14" strokeWidth="20" fill="none" />
            <path d="M270 165l55-112 72 113-44-26-29-46-22 54Z" fill="#77878a" stroke="#c2c7bb" />
            <text x="60" y="1430" fill="#a8b8b9" fontSize="13">THE OUTER SEA</text>
            <text x="470" y="530" fill="#8d9c9e" fontSize="12">THE CLOUD LINE</text>
            <rect width="700" height="1530" fill="url(#atlas-grain)" />
            {WORLD_CHECKPOINTS.slice(1).map((point, i) => <path key={point.id} d={`M${WORLD_CHECKPOINTS[i].mapPosition.join(" ")} L${point.mapPosition.join(" ")}`} fill="none" stroke={point.level <= level ? "#c2a464" : "#657170"} strokeWidth={point.level <= level ? 3 : 2} strokeDasharray={point.level > level ? "4 7" : undefined} />)}
            {WORLD_REGIONS.map(region => <g key={region.id}>
              <rect x="10" y={region.checkpoints.at(-1)!.mapPosition[1] - 40} width="680" height={region.checkpoints.length * 33 + 50} fill="#152025" opacity={region.levelStart > level + 5 ? .45 : 0} />
              <text x="30" y={region.checkpoints.at(-1)!.mapPosition[1] - 22} fill="#c7cbc2" fontSize="15">{region.name}</text>
              <text x="30" y={region.checkpoints.at(-1)!.mapPosition[1] - 5} fill="#a5aaa4" fontSize="11">{levelRange(region)}</text>
            </g>)}
          </svg>
          {WORLD_CHECKPOINTS.map(point => {
            const active = point.level === current.checkpoint.level;
            const completed = point.level < level;
            return <button key={point.id} data-level={point.level} className={`map-node ${active ? "is-current" : completed ? "is-complete" : "is-locked"}`} style={{ left: point.mapPosition[0] * zoom, top: point.mapPosition[1] * zoom }} aria-label={`Level ${point.level}, ${point.name}, ${active ? "current location" : completed ? "completed" : "locked"}`} aria-pressed={selected === point.level} onClick={() => setSelected(point.level)}>
              <span>{active ? <Flag size={15} /> : completed ? "✓" : point.level}</span>{active && <strong>You are here</strong>}
            </button>;
          })}
        </div>
      </div>
      <div className="map-tools"><button title="Zoom in" aria-label="Zoom in" onClick={() => setZoom(z => Math.min(2, z + .2))}><Plus size={18} /></button><button title="Zoom out" aria-label="Zoom out" onClick={() => setZoom(z => Math.max(.65, z - .2))}><Minus size={18} /></button><button title="Center on player" aria-label="Center on player" onClick={() => { setSelected(current.checkpoint.level); center(); }}><Crosshair size={18} /></button></div>
      <aside className="map-details" aria-live="polite">
        <p className="map-status">{status === "Locked" && <LockKeyhole size={12} />} {status} · Level {selected === current.checkpoint.level && level > 26 ? level : selected}</p>
        <h3>{info.checkpoint.name}</h3><p>{info.region.name}</p><p>{info.checkpoint.description}</p>
        {status === "Locked" && <p>Required: Reach Level {selected}</p>}
        <hr /><p>{info.region.theme}</p><p>{levelRange(info.region)} · {Math.max(0, Math.min(info.region.checkpoints.length, level - info.region.levelStart + 1))}/{info.region.checkpoints.length} checkpoints reached</p>
        <div className="map-region-points">{info.region.checkpoints.map(point => <button key={point.id} onClick={() => setSelected(point.level)} aria-pressed={selected === point.level}>{point.level}. {point.name}</button>)}</div>
        <hr /><p className="map-status">Next checkpoint</p><p>{next ? `Level ${next.checkpoint.level} · ${next.checkpoint.name}` : "The Summit · Legacy continues"}</p>
        {nextRegion && <><p className="map-status">Next region</p><p>{nextRegion.name}<br />{levelRange(nextRegion)}</p></>}
        <p className="map-status">Ultimate destination</p><p>The Summit · Level 26+</p>
      </aside>
    </div>
  </dialog>;
}
