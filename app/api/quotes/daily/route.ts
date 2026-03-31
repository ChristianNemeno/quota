import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

function toQuoteResponse(quote: QuoteWithTags) {
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

function dateHash(dateStr: string): number {
  let hash = 0;

  for (let i = 0; i < dateStr.length; i += 1) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }

  return hash;
}

export async function GET() {
  const count = await prisma.quote.count();

  if (count === 0) {
    return NextResponse.json({ error: "No quotes found" }, { status: 404 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const skip = dateHash(today) % count;

  const quote = await prisma.quote.findFirst({
    skip,
    take: 1,
    include: quoteInclude,
  });

  if (!quote) {
    return NextResponse.json({ error: "No quotes found" }, { status: 404 });
  }

  return NextResponse.json(toQuoteResponse(quote));
}
