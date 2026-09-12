"use client";
import { EffectComposer, Bloom, FXAA, N8AO, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useGraphicsQuality } from "./GraphicsQuality";

export default function SceneEffects() {
  const { config, preset } = useGraphicsQuality();

  return (
    <EffectComposer key={preset} multisampling={config.msaaSamples} depthBuffer>
      {config.aoEnabled && (
        <N8AO
          halfRes
          quality={preset === "ultra" || preset === "high" ? "medium" : "low"}
          aoRadius={0.45}
          distanceFalloff={0.6}
          intensity={1.15}
          color="#26323b"
        />
      )}
      {config.bloomEnabled && (
        <Bloom
          intensity={0.35}
          luminanceThreshold={1.0}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
      )}
      {config.fxaaEnabled && <FXAA />}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
