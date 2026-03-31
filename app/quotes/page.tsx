import Link from "next/link";
import { Prisma } from "@prisma/client";

import QuoteCard from "@/components/QuoteCard";
import TagBadge from "@/components/TagBadge";
import { prisma } from "@/lib/prisma";
import type { Quote } from "@/lib/types";

const PAGE_SIZE = 20;

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

type PageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function QuotesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number.parseInt(params.page ?? "1", 10);
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  const skip = (currentPage - 1) * PAGE_SIZE;

  const [quotes, totalCount, tags] = await Promise.all([
    prisma.quote.findMany({
      include: quoteInclude,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.quote.count(),
    prisma.tag.findMany({
      include: {
        _count: {
          select: {
            quotes: true,
          },
        },
      },
      orderBy: {
        quotes: {
          _count: "desc",
        },
      },
    }),
  ]);

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = skip + quotes.length < totalCount;

  return (
    <div className="grid w-full gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a84c]">
            — Tags —
          </p>
          <h1 className="font-serif text-xl font-semibold italic text-[#1a1410] dark:text-[#f5ead8]">
            Browse the archive.
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
          {tags.map((tag) => (
            <TagBadge key={tag.id} name={tag.name} />
          ))}
        </div>
      </aside>

      <section className="space-y-8">
        {quotes.length > 0 ? (
          <div className="grid gap-6">
            {quotes.map((quote) => (
              <QuoteCard key={quote.id} quote={toQuote(quote)} />
            ))}
          </div>
        ) : (
          <div className="vn-empty-frame flex min-h-[300px] items-center justify-center p-10">
            <p className="font-serif italic text-[#c9a84c]/60 text-center">
              No quotes in the archive yet.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          {hasPreviousPage ? (
            <Link
              href={`/quotes?page=${currentPage - 1}`}
              className="vn-skip inline-block px-6 py-2 text-sm font-medium text-[#f5ead8]"
            >
              ← Previous
            </Link>
          ) : (
            <span className="inline-block cursor-not-allowed px-6 py-2 text-sm font-medium text-[#f5ead8]/30 opacity-40">
              ← Previous
            </span>
          )}

          <span className="font-serif italic text-sm text-[#c9a84c]">
            Page {currentPage}
          </span>

          {hasNextPage ? (
            <Link
              href={`/quotes?page=${currentPage + 1}`}
              className="vn-skip inline-block px-6 py-2 text-sm font-medium text-[#f5ead8]"
            >
              Next →
            </Link>
          ) : (
            <span className="inline-block cursor-not-allowed px-6 py-2 text-sm font-medium text-[#f5ead8]/30 opacity-40">
              Next →
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
