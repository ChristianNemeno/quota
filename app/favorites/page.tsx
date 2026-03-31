"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { getFavorites } from "@/lib/favorites";
import type { Quote } from "@/lib/types";

const QuoteGraph = dynamic(() => import("@/components/QuoteGraph"), {
  ssr: false,
});

export default function FavoritesPage() {
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [hasFavorites, setHasFavorites] = useState(false);

  useEffect(() => {
    async function loadQuotes() {
      const favoriteIds = getFavorites();

      if (favoriteIds.length === 0) {
        setHasFavorites(false);
        setQuotes([]);
        setLoading(false);
        return;
      }

      setHasFavorites(true);

      try {
        const response = await fetch(`/api/quotes?ids=${favoriteIds.join(",")}`);

        if (!response.ok) {
          throw new Error("Failed to load favorite quotes");
        }

        const data = (await response.json()) as Quote[];
        setQuotes(data);
      } catch {
        setQuotes([]);
      } finally {
        setLoading(false);
      }
    }

    void loadQuotes();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center rounded-3xl border border-neutral-200 bg-white text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
        Loading favorites...
      </div>
    );
  }

  if (!hasFavorites) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-white px-6 text-center dark:border-neutral-700 dark:bg-neutral-950">
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
            No favorites yet.
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Browse quotes and double-click any card to save it.
          </p>
          <Link
            href="/quotes"
            className="inline-flex rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Browse quotes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[70vh] w-full flex-col gap-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
          Favorites
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
          Your saved quotes as a connected map.
        </h1>
      </div>

      <div className="min-h-0 flex-1">
        <QuoteGraph quotes={quotes} />
      </div>
    </div>
  );
}
