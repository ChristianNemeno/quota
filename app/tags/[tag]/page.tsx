import Link from "next/link";
import { Prisma } from "@prisma/client";

import QuoteCard from "@/components/QuoteCard";
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
  params: Promise<{
    tag: string;
  }>;
};

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;

  const [tagRecord, quotes] = await Promise.all([
    prisma.tag.findUnique({
      where: {
        name: tag,
      },
    }),
    prisma.quote.findMany({
      where: {
        tags: {
          some: {
            tag: {
              name: tag,
            },
          },
        },
      },
      include: quoteInclude,
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  if (!tagRecord) {
    return (
      <div className="w-full space-y-4">
        <Link
          href="/quotes"
          className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          Back to all quotes
        </Link>

        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300">
          No quotes were found for the tag <strong>{tag}</strong>.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div className="space-y-3">
        <Link
          href="/quotes"
          className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          Back to all quotes
        </Link>

        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
            Tag
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
            {tagRecord.name}
          </h1>
        </div>
      </div>

      <div className="grid gap-6">
        {quotes.map((quote) => (
          <QuoteCard key={quote.id} quote={toQuote(quote)} />
        ))}
      </div>
    </div>
  );
}
