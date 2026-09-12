"use client";

import dynamic from "next/dynamic";
import TopHUD from "./TopHUD";
import SideNavigation from "./SideNavigation";
import PlayerProgress from "./PlayerProgress";
import QuickActions from "./QuickActions";
import { mockPlayer } from "@/data/mockPlayer";

const GameScene = dynamic(() => import("@/components/game/GameScene"), {
  ssr: false,
});

export default function Dashboard() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-void">
      <GameScene />

      <div className="pointer-events-none relative z-10 h-full w-full">
        <TopHUD player={mockPlayer} />
        <SideNavigation />
        <PlayerProgress player={mockPlayer} />
        <QuickActions />
      </div>
    </div>
  );
}
