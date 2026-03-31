"use client";

import { useEffect, useState } from "react";

import TagBadge from "@/components/TagBadge";
import { isFavorite, toggleFavorite } from "@/lib/favorites";
import type { Quote } from "@/lib/types";

type Props = {
  quote: Quote;
};

const PARTICLES = [
  { left: "50%", delay: "0ms",   size: "1.25rem" },
  { left: "36%", delay: "70ms",  size: "1rem"    },
  { left: "64%", delay: "55ms",  size: "1.1rem"  },
  { left: "25%", delay: "130ms", size: "0.85rem" },
  { left: "75%", delay: "40ms",  size: "0.95rem" },
  { left: "44%", delay: "100ms", size: "0.9rem"  },
  { left: "58%", delay: "20ms",  size: "1.05rem" },
];

export default function QuoteCard({ quote }: Props) {
  const [favorited, setFavorited] = useState(false);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    setFavorited(isFavorite(quote.id));
  }, [quote.id]);

  function handleDoubleClick() {
    const next = toggleFavorite(quote.id);
    setFavorited(next);
    if (next) {
      setBurst(true);
      setTimeout(() => setBurst(false), 950);
    }
  }

  return (
    <article
      onDoubleClick={handleDoubleClick}
      className="vn-better-textbox vn-fadein relative cursor-pointer select-none px-8 py-12 sm:px-12 sm:py-14 text-center transition-transform duration-200 hover:-translate-y-1"
      style={favorited ? { animation: "card-glow-in 0.4s ease-out forwards", filter: "drop-shadow(0 0 18px rgba(201,168,76,0.4))" } : undefined}
    >
      {/* Burst particles on favorite */}
      {burst && PARTICLES.map((p, i) => (
        <span
          key={i}
          className="pointer-events-none absolute z-20 text-[#c9a84c]"
          style={{
            left: p.left,
            top: "50%",
            fontSize: p.size,
            animationName: "burst-heart",
            animationDuration: "0.85s",
            animationDelay: p.delay,
            animationTimingFunction: "ease-out",
            animationFillMode: "forwards",
          }}
          aria-hidden="true"
        >
          ♥
        </span>
      ))}

      {/* Favorited badge — Icon08 (star shield) with pop-in animation */}
      {favorited && (
        <div
          className="absolute right-5 top-4"
          style={{ animation: "badge-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
        >
          <img
            src="/ui-game-assets/Icon08.png"
            alt="Saved"
            className="h-7 w-7 object-contain opacity-90"
            style={{ filter: "sepia(1) saturate(3) hue-rotate(-10deg) brightness(1.1)" }}
          />
        </div>
      )}

      {/* Opening quote glyph */}
      <div className="mb-2 select-none text-3xl leading-none text-[#c9a84c]/50">&ldquo;</div>

      <blockquote className="space-y-3">
        <p className="font-serif text-sm italic leading-6 text-[#f5ead8]">
          {quote.text}
        </p>

        <footer className="flex flex-col items-center gap-0.5">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#c9a84c]">
            {quote.author}
          </span>
          <span className="vn-namebox-underline mx-auto" aria-hidden="true" />
        </footer>
      </blockquote>

      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {quote.tags.map((tag) => (
          <TagBadge key={tag.id} name={tag.name} />
        ))}
      </div>

      <div className="vn-ctc absolute bottom-5 right-7 hidden sm:block" aria-hidden="true" />
    </article>
  );
}
