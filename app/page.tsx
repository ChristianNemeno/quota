import { Prisma } from "@prisma/client";

import QuoteCard from "@/components/QuoteCard";
import RandomQuote from "@/components/RandomQuote";
import { prisma } from "@/lib/prisma";
import type { Quote } from "@/lib/types";

const quoteInclude = {
  tags: {
    include: {
      tag: true,
    },
  },
} satisfies Prisma.QuoteInclude;

type QuoteWithTags = Prisma.QuoteGetPayload<{
  include: typeof quoteInclude;
}>;

function dateHash(dateStr: string): number {
  let hash = 0;

  for (let i = 0; i < dateStr.length; i += 1) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }

  return hash;
}

function toQuote(quote: QuoteWithTags): Quote {
  return {
    id: quote.id,
    text: quote.text,
    author: quote.author,
    createdAt: quote.createdAt.toISOString(),
    tags: quote.tags.map(({ tag }) => ({
      id: tag.id,
      name: tag.name,
    })),
  };
}

async function getDailyQuote(): Promise<Quote | null> {
  const count = await prisma.quote.count();

  if (count === 0) {
    return null;
  }

  const today = new Date().toISOString().slice(0, 10);
  const skip = dateHash(today) % count;

  const quote = await prisma.quote.findFirst({
    skip,
    take: 1,
    include: quoteInclude,
  });

  return quote ? toQuote(quote) : null;
}

export default async function Home() {
  const dailyQuote = await getDailyQuote();

  return (
    <div className="flex w-full flex-col gap-10">
      <section className="w-full space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
            Daily Quote
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
            One quote worth sitting with.
          </h1>
        </div>

        {dailyQuote ? (
          <QuoteCard quote={dailyQuote} />
        ) : (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300">
            No quotes are available yet. Run the Prisma seed to populate the
            database.
          </div>
        )}
      </section>

      <section className="w-full">
        <RandomQuote />
      </section>
    </div>
  );
}
