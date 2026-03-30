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
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
            Explore
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
            Pull a random quote from the collection.
          </h2>
        </div>

        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-wait disabled:opacity-70 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
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
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300">
            Click the button to load a random quote.
          </div>
        )}
      </div>
    </div>
  );
}
