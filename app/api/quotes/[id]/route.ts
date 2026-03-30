import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

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

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: quoteInclude,
  });

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  return NextResponse.json(toQuoteResponse(quote));
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = (await request.json()) as {
    text?: unknown;
    author?: unknown;
    tags?: unknown;
  };

  const existingQuote = await prisma.quote.findUnique({
    where: { id },
  });

  if (!existingQuote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const data: Prisma.QuoteUpdateInput = {};

  if (typeof body.text === "string") {
    data.text = body.text.trim();
  }

  if (typeof body.author === "string") {
    data.author = body.author.trim();
  }

  if (body.tags !== undefined) {
    const tags = normalizeTags(body.tags);

    await prisma.tagsOnQuotes.deleteMany({
      where: { quoteId: id },
    });

    data.tags = {
      create: tags.map((name) => ({
        tag: {
          connectOrCreate: {
            where: { name },
            create: { name },
          },
        },
      })),
    };
  }

  const quote = await prisma.quote.update({
    where: { id },
    data,
    include: quoteInclude,
  });

  return NextResponse.json(toQuoteResponse(quote));
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const existingQuote = await prisma.quote.findUnique({
    where: { id },
  });

  if (!existingQuote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  await prisma.quote.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
