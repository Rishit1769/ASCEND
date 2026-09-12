"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import AscendLoader from "@/components/ui/AscendLoader";
import { onLoaderProgress, onLoaderReady } from "@/components/ui/AscendLoaderContext";

const Dashboard = dynamic(
  () => import("@/components/dashboard/Dashboard"),
  { ssr: false }
);

function AppLoader() {
  const [dashboardReady, setDashboardReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [realmId, setRealmId] = useState<string | null>(null);

  // Mount Dashboard after a short delay
  useEffect(() => {
    const timer = setTimeout(() => setDashboardReady(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Listen for R3F progress and ready signals
  useEffect(() => {
    const offProgress = onLoaderProgress((p) => setProgress(p));
    const offReady = onLoaderReady((id) => {
      setRealmId(id ?? null);
      setSceneReady(true);
    });
    return () => {
      offProgress();
      offReady();
    };
  }, []);

  const handleLoaderComplete = useCallback(() => {
    setLoaderVisible(false);
  }, []);

  const showLoader = loaderVisible && (!sceneReady || progress < 100);

  return (
    <>
      {dashboardReady && <Dashboard />}
      <AscendLoader
        progress={progress}
        visible={showLoader}
        realmId={realmId}
        onComplete={handleLoaderComplete}
      />
    </>
  );
}

export default function Home() {
  return <AppLoader />;
}
