import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag")?.trim().toLowerCase();
  const idsParam = searchParams.get("ids")?.trim();
  const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const limit = Number.parseInt(searchParams.get("limit") ?? "20", 10);

  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 20;

  const ids = idsParam
    ? idsParam
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    : [];

  const where: Prisma.QuoteWhereInput = {};

  if (tag) {
    where.tags = {
      some: {
        tag: {
          name: {
            equals: tag,
            mode: "insensitive",
          },
        },
      },
    };
  }

  if (ids.length > 0) {
    where.id = {
      in: ids,
    };
  }

  const quotes = await prisma.quote.findMany({
    where,
    include: quoteInclude,
    orderBy: {
      createdAt: "desc",
    },
    ...(ids.length > 0
      ? {}
      : {
          skip: (safePage - 1) * safeLimit,
          take: safeLimit,
        }),
  });

  return NextResponse.json(quotes.map(toQuoteResponse));
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    text?: unknown;
    author?: unknown;
    tags?: unknown;
  };

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const author = typeof body.author === "string" ? body.author.trim() : "";
  const tags = normalizeTags(body.tags);

  if (!text || !author) {
    return NextResponse.json(
      { error: "text and author are required" },
      { status: 400 },
    );
  }

  const quote = await prisma.quote.create({
    data: {
      text,
      author,
      tags: {
        create: tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
    },
    include: quoteInclude,
  });

  return NextResponse.json(toQuoteResponse(quote), { status: 201 });
}
