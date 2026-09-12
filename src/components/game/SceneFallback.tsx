"use client";

export default function SceneFallback() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #05070D 0%, #0B1220 28%, #152033 66%, #26354A 100%)",
        }}
      />

      <div className="absolute inset-0 opacity-30">
        <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-[#10151B] via-[#111B2A] to-transparent" />
      </div>

      <div className="absolute top-[15%] left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#191A38] opacity-15 blur-[120px]" />
      <div className="absolute top-[10%] left-[30%] h-[200px] w-[300px] rounded-full bg-[#31305F] opacity-[0.06] blur-[80px]" />

      <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.04] blur-[2px]"
        style={{
          background:
            "radial-gradient(circle, #d4a543 0%, transparent 70%)",
        }}
      />

      <div className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 80%, transparent 40%, #05070D 75%)",
        }}
      />

      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
