"use client";

import { useEffect, useState } from "react";

import { isFavorite, toggleFavorite } from "@/lib/favorites";

type Props = {
  quoteId: string;
};

export default function FavoriteButton({ quoteId }: Props) {
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    setFavorited(isFavorite(quoteId));
  }, [quoteId]);

  const label = favorited ? "Remove from favorites" : "Add to favorites";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => setFavorited(toggleFavorite(quoteId))}
      className={`inline-flex h-9 w-9 items-center justify-center text-2xl leading-none transition-transform duration-150 hover:scale-125 active:scale-95 ${
        favorited
          ? "text-[#c9a84c] drop-shadow-[0_0_6px_rgba(201,168,76,0.8)]"
          : "text-[#f5ead8]/40 hover:text-[#c9a84c]/80"
      }`}
    >
      <span aria-hidden="true">{favorited ? "♥" : "♡"}</span>
    </button>
  );
}
