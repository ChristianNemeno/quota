import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

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

export async function GET() {
  const count = await prisma.quote.count();

  if (count === 0) {
    return NextResponse.json({ error: "No quotes found" }, { status: 404 });
  }

  const randomSkip = Math.floor(Math.random() * count);
  const quote = await prisma.quote.findFirst({
    skip: randomSkip,
    take: 1,
    include: quoteInclude,
  });

  if (!quote) {
    return NextResponse.json({ error: "No quotes found" }, { status: 404 });
  }

  return NextResponse.json(toQuoteResponse(quote));
}
