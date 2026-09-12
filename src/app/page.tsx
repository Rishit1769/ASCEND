"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import LoadingScreen from "@/components/ui/LoadingScreen";

const Dashboard = dynamic(
  () => import("@/components/dashboard/Dashboard"),
  {
    ssr: false,
    loading: () => <LoadingScreen />,
  }
);

function AppLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) return <LoadingScreen />;

  return <Dashboard />;
}

export default function Home() {
  return <AppLoader />;
}
