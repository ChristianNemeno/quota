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
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
            Tags
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
            Browse the quote archive.
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
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300">
            No quotes are available yet. Run the Prisma seed to populate the
            archive.
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          {hasPreviousPage ? (
            <Link
              href={`/quotes?page=${currentPage - 1}`}
              className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
            >
              Previous
            </Link>
          ) : (
            <span className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-400 dark:border-neutral-800 dark:text-neutral-600">
              Previous
            </span>
          )}

          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            Page {currentPage}
          </span>

          {hasNextPage ? (
            <Link
              href={`/quotes?page=${currentPage + 1}`}
              className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-400 dark:border-neutral-800 dark:text-neutral-600">
              Next
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
