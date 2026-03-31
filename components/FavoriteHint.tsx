"use client";

import { useEffect, useRef, useState } from "react";

export default function FavoriteHint() {
  const [phase, setPhase] = useState<"hidden" | "in" | "visible" | "out">("hidden");
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    setPhase("in");
    // switch to "visible" after slide-in finishes (400ms)
    setTimeout(() => setPhase("visible"), 420);
    // auto-dismiss after 4.5s of total visibility
    dismissTimer.current = setTimeout(dismiss, 4500);
  }

  function dismiss() {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setPhase("out");
    setTimeout(() => setPhase("hidden"), 420);
  }

  useEffect(() => {
    const first = setTimeout(show, 9000);
    const repeat = setInterval(show, 50000);
    return () => {
      clearTimeout(first);
      clearInterval(repeat);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={dismiss}
      className="fixed bottom-6 right-6 z-50 flex cursor-pointer items-center gap-3 px-5 py-3"
      style={{
        backgroundImage: "url('/gui/notify.png')",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        minWidth: "300px",
        animationName: phase === "in" ? "hint-slide-in" : phase === "out" ? "hint-slide-out" : undefined,
        animationDuration: "0.4s",
        animationTimingFunction: phase === "in" ? "cubic-bezier(0.22,1,0.36,1)" : "ease-in",
        animationFillMode: "forwards",
      }}
    >
      {/* Icon08 tinted gold */}
      <img
        src="/ui-game-assets/Icon08.png"
        alt=""
        aria-hidden="true"
        className="h-8 w-8 shrink-0 object-contain"
        style={{ filter: "sepia(1) saturate(3) hue-rotate(-10deg) brightness(1.15)" }}
      />

      <div className="flex flex-col">
        <span className="font-sans text-xs font-semibold uppercase tracking-widest text-[#c9a84c]">
          Tip
        </span>
        <span className="font-sans text-xs text-[#f5ead8]/90">
          Double-click any quote to save it ✦
        </span>
      </div>

      {/* Dismiss x */}
      <span className="ml-auto pl-3 text-[10px] text-[#f5ead8]/40">✕</span>
    </div>
  );
}
