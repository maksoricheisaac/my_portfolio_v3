"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { NetworkFallback } from "@/components/three/network-fallback";
import { cn } from "@/lib/utils";

const NetworkScene = dynamic(() => import("@/components/three/network-scene"), {
  ssr: false,
});

type Mode = "fallback" | "webgl";

/** WebGL only when supported and affordable; the SVG fallback is always rendered underneath. */
function detect(): { mode: Mode; animate: boolean } {
  try {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowPower =
      (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
        ?.saveData === true;
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl || lowPower || saveData) return { mode: "fallback", animate: false };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return { mode: "webgl", animate: !reduced };
  } catch {
    return { mode: "fallback", animate: false };
  }
}

export function HeroScene({ label, className }: { label: string; className?: string }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ mode: Mode; animate: boolean }>({
    mode: "fallback",
    animate: false,
  });
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  // The scene is heavy: start it on first interaction, or after a long idle delay,
  // so it never competes with first paint and input responsiveness.
  useEffect(() => {
    let started = false;
    const events = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"] as const;
    const start = () => {
      if (started) return;
      started = true;
      cleanup();
      setState(detect());
    };
    const timer = setTimeout(start, 6000);
    function cleanup() {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, start));
    }
    events.forEach((e) => window.addEventListener(e, start, { passive: true, once: true }));
    return cleanup;
  }, []);

  // Stop rendering when scrolled away or when the tab is hidden.
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const live = state.mode === "webgl";

  return (
    <div ref={wrapper} role="img" aria-label={label} className={cn("relative", className)}>
      <NetworkFallback
        className={cn(
          "absolute inset-0 size-full transition-opacity duration-700",
          live ? "opacity-0" : "opacity-100",
        )}
      />
      {live && (
        <div className="absolute inset-0 animate-in fade-in duration-700">
          <NetworkScene animate={state.animate} paused={!visible || !tabVisible} />
        </div>
      )}
    </div>
  );
}
