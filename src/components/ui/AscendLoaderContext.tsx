"use client";

/**
 * Global loader state communicated via DOM events.
 * This avoids context issues between React's main tree and R3F's Canvas tree.
 */

const EVENT_PROGRESS = "ascend-loader-progress";
const EVENT_READY = "ascend-loader-ready";

export interface LoaderProgressEvent extends CustomEvent {
  detail: { progress: number };
}

export interface LoaderReadyEvent extends CustomEvent {
  detail: { realmId?: string };
}

/** Emit from inside R3F Canvas to report asset loading progress. */
export function emitLoaderProgress(progress: number) {
  window.dispatchEvent(
    new CustomEvent(EVENT_PROGRESS, { detail: { progress } })
  );
}

/** Emit from R3F Canvas when a realm finishes loading. */
export function emitLoaderReady(realmId?: string) {
  window.dispatchEvent(
    new CustomEvent(EVENT_READY, { detail: { realmId } })
  );
}

/** Listen for progress updates. Returns cleanup function. */
export function onLoaderProgress(callback: (progress: number) => void) {
  const handler = (e: Event) => {
    callback((e as LoaderProgressEvent).detail.progress);
  };
  window.addEventListener(EVENT_PROGRESS, handler);
  return () => window.removeEventListener(EVENT_PROGRESS, handler);
}

/** Listen for scene-ready signal. Returns cleanup function. */
export function onLoaderReady(callback: (realmId?: string) => void) {
  const handler = (e: Event) => {
    callback((e as LoaderReadyEvent).detail.realmId);
  };
  window.addEventListener(EVENT_READY, handler);
  return () => window.removeEventListener(EVENT_READY, handler);
}
