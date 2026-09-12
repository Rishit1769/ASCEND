"use client";
import { Bloom, EffectComposer, FXAA, N8AO, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useGraphicsQuality } from "./GraphicsQuality";

export default function SceneEffects() {
  const quality = useGraphicsQuality();
  return <EffectComposer key={quality} multisampling={quality === "high" ? 4 : 0} depthBuffer>
    <N8AO enabled={quality !== "low"} halfRes quality={quality === "high" ? "medium" : "low"} aoRadius={.45} distanceFalloff={.6} intensity={1.15} color="#26323b" />
    {quality === "high" && <Bloom intensity={.12} luminanceThreshold={1.3} luminanceSmoothing={.35} mipmapBlur />}
    {quality !== "high" && <FXAA />}
    <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
  </EffectComposer>;
}
