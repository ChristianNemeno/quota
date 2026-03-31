"use client";

import { useState } from "react";

import QuoteCard from "@/components/QuoteCard";
import type { Quote } from "@/lib/types";

export default function RandomQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    setVisible(false);

    try {
      const response = await fetch("/api/quotes/random");

      if (!response.ok) {
        throw new Error("Failed to fetch random quote");
      }

      const nextQuote = (await response.json()) as Quote;

      setQuote(nextQuote);
      setTimeout(() => setVisible(true), 40);
    } catch {
      setVisible(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a84c]">
            — Explore —
          </p>
          <h2 className="font-serif text-2xl font-semibold italic text-[#1a1410] dark:text-[#f5ead8]">
            Pull a random quote from the collection.
          </h2>
        </div>

        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="vn-btn-action px-6 py-2 text-sm font-medium text-[#f5ead8]"
        >
          {loading ? "Loading..." : "Random Quote"}
        </button>
      </div>

      <div
        className={`transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {quote ? (
          <QuoteCard quote={quote} />
        ) : (
          <div className="vn-empty-frame flex min-h-[200px] items-center justify-center p-10">
            <p className="font-serif italic text-[#c9a84c]/60">
              Click the button to draw a quote…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
