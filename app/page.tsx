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
      <section className="vn-main-menu w-full space-y-6 rounded-xl px-8 py-10">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a84c]">
            — Daily Quote —
          </p>
          <h1 className="font-serif text-3xl font-semibold italic text-[#f5ead8]">
            One quote worth sitting with.
          </h1>
        </div>

        {/* Static double-click hint — always visible below the heading */}
        <div className="flex items-center gap-2.5">
          <img
            src="/ui-game-assets/Icon08.png"
            alt=""
            aria-hidden="true"
            className="h-5 w-5 shrink-0 object-contain opacity-80"
            style={{ filter: "sepia(1) saturate(3) hue-rotate(-10deg) brightness(1.1)" }}
          />
          <p className="text-xs text-[#f5ead8]/60 tracking-wide">
            Double-click any quote card to save it to your favorites
          </p>
          <span className="text-[#c9a84c]/50 text-xs select-none">✦</span>
        </div>

        {dailyQuote ? (
          <QuoteCard quote={dailyQuote} />
        ) : (
          <div className="vn-frame flex min-h-[300px] items-center justify-center p-10">
            <p className="font-serif italic text-[#c9a84c]/70 text-center">
              No quotes yet. Run the seed script to begin the story.
            </p>
          </div>
        )}
      </section>

      <section className="w-full">
        <RandomQuote />
      </section>
    </div>
  );
}
