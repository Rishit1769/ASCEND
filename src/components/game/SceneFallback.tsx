"use client";

export default function SceneFallback() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background: "linear-gradient(to bottom, #060913 0%, #14243a 28%, #405873 58%, #18283a 100%)",
      }}
    />
  );
}
