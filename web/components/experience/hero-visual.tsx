"use client";

import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";

// The 3D chunk (three.js) is only fetched in the browser, after hydration, and only when WebGL works.
const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false });

/** "<webgl><reduced><small>" as 0/1 flags; a primitive keeps the snapshot referentially stable. */
function snapshot(): string {
  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.matchMedia("(max-width: 767px)").matches;
  return `${+webgl}${+reduced}${+small}`;
}

let cached: string | null = null;
function getSnapshot() {
  cached ??= snapshot();
  return cached;
}
const subscribe = () => () => {};

/**
 * Static CSS/SVG composition: it is the no-WebGL fallback, and the first paint under the canvas.
 * It is decorative, so it is hidden from assistive technology.
 */
function Fallback() {
  return (
    <svg viewBox="0 0 400 400" className="size-full" fill="none" aria-hidden="true">
      <g stroke="#969ba5" strokeOpacity="0.35" strokeWidth="1">
        <circle cx="200" cy="200" r="150" />
        <ellipse cx="200" cy="200" rx="150" ry="52" transform="rotate(-24 200 200)" />
        <ellipse cx="200" cy="200" rx="150" ry="52" transform="rotate(36 200 200)" />
      </g>
      <polygon
        points="200,96 290,148 290,252 200,304 110,252 110,148"
        stroke="#f2f1ec"
        strokeOpacity="0.55"
        fill="#101216"
      />
      <path
        d="M200 96v208M110 148l180 104M290 148 110 252"
        stroke="#5b9cff"
        strokeOpacity="0.7"
      />
    </svg>
  );
}

export function HeroVisual({ label }: { label: string }) {
  const flags = useSyncExternalStore(subscribe, getSnapshot, () => "000");
  const webgl = flags[0] === "1";
  const reduced = flags[1] === "1";
  const small = flags[2] === "1";
  const [sceneReady, setSceneReady] = useState(false);

  return (
    <div role="img" aria-label={label} className="relative size-full">
      <div
        className={`absolute inset-0 grid place-items-center p-8 transition-opacity duration-700 ${sceneReady ? "opacity-0" : "opacity-40"}`}
      >
        <Fallback />
      </div>
      {webgl && (
        <div className="absolute inset-0">
          <HeroScene reduced={reduced} small={small} onReady={() => setSceneReady(true)} />
        </div>
      )}
    </div>
  );
}
