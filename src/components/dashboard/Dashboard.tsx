"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import TopHUD from "./TopHUD";
import SideNavigation from "./SideNavigation";
import PlayerProgress from "./PlayerProgress";
import QuickActions from "./QuickActions";
import QuestPanel from "./QuestPanel";
import JourneyTeaser from "./JourneyTeaser";
import { PlayerProvider, usePlayer } from "@/lib/playerStore";
import { WorldProgressProvider, WorldLocation } from "../game/WorldProgress";
import WorldMap from "./WorldMap";

const GameScene = dynamic(() => import("@/components/game/GameScene"), {
  ssr: false,
});

export default function Dashboard() {
  return (
    <PlayerProvider>
      <WorldProgressGate />
    </PlayerProvider>
  );
}

// The world level is driven by the persistent player level (dev preview can override it).
function WorldProgressGate() {
  const { level } = usePlayer();
  const [mapOpen, setMapOpen] = useState(false);
  const [questOpen, setQuestOpen] = useState(false);
  const [teaserOpen, setTeaserOpen] = useState(true);
  const { isMaxLevel } = usePlayer();

  return (
    <WorldProgressProvider level={level}>
      <div className="relative h-[100dvh] w-screen overflow-hidden bg-void">
        <GameScene />

        <div className="pointer-events-none relative z-10 h-full w-full">
          <TopHUD />
          <WorldLocation />
          <SideNavigation onMap={() => setMapOpen(true)} onQuests={() => setQuestOpen(true)} />
          <PlayerProgress />
          <QuickActions />
        </div>

        {mapOpen && <WorldMap onClose={() => setMapOpen(false)} />}
        {questOpen && <QuestPanel onClose={() => setQuestOpen(false)} />}
        {isMaxLevel && teaserOpen && <JourneyTeaser onClose={() => setTeaserOpen(false)} />}
      </div>
    </WorldProgressProvider>
  );
}
