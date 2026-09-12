"use client";

import dynamic from "next/dynamic";
import TopHUD from "./TopHUD";
import SideNavigation from "./SideNavigation";
import PlayerProgress from "./PlayerProgress";
import QuickActions from "./QuickActions";
import { mockPlayer } from "@/data/mockPlayer";
import { useState } from "react";
import { WorldProgressProvider, WorldLocation, useWorldProgress } from "../game/WorldProgress";
import WorldMap from "./WorldMap";

const GameScene = dynamic(() => import("@/components/game/GameScene"), {
  ssr: false,
});

export default function Dashboard() {
  return <WorldProgressProvider level={mockPlayer.level}><DashboardContent /></WorldProgressProvider>;
}

function DashboardContent() {
  const [mapOpen, setMapOpen] = useState(false);
  const { level } = useWorldProgress();
  const player = { ...mockPlayer, level };
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-void">
      <GameScene />

      <div className="pointer-events-none relative z-10 h-full w-full">
        <TopHUD player={player} />
        <WorldLocation />
        <SideNavigation onMap={() => setMapOpen(true)} />
        <PlayerProgress player={player} />
        <QuickActions />
      </div>
      {mapOpen && <WorldMap onClose={() => setMapOpen(false)} />}
    </div>
  );
}
