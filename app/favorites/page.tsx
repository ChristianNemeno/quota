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
      <div
        className="flex min-h-[60vh] w-full items-center justify-center px-8 py-10 text-[#f5ead8]/60"
      >
        <p className="font-serif italic text-sm">Loading favorites…</p>
      </div>
    );
  }

  if (!hasFavorites) {
    return (
      <div
        className="flex min-h-[60vh] w-full flex-col items-center justify-center px-8 py-12 text-center"
      >
        <div className="max-w-xl space-y-4">
          <h1 className="font-serif text-3xl font-semibold italic text-[#f5ead8]">
            No favorites yet.
          </h1>
          <p className="text-sm text-[#f5ead8]/60">
            Browse quotes and double-click any card to save it.
          </p>
          <Link
            href="/quotes"
            className="vn-btn-choice inline-block px-6 py-2 text-sm font-medium text-[#f5ead8]"
          >
            Browse quotes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[70vh] w-full flex-col gap-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a84c]">
          — Favorites —
        </p>
        <h1 className="font-serif text-3xl font-semibold italic text-[#1a1410] dark:text-[#f5ead8]">
          Your saved quotes as a connected map.
        </h1>
      </div>

      <div className="min-h-0 flex-1">
        <QuoteGraph quotes={quotes} />
      </div>
    </div>
  );
}
