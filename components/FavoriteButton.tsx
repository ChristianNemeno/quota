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
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-2xl text-neutral-400 transition-colors hover:border-neutral-300 hover:text-red-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500 dark:hover:border-neutral-600 dark:hover:text-red-400"
    >
      <span aria-hidden="true">{favorited ? "♥" : "♡"}</span>
    </button>
  );
}
