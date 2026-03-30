import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import type { TagWithCount } from "@/lib/types";

export async function GET() {
  const tags = await prisma.tag.findMany({
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
  });

  return NextResponse.json(tags satisfies TagWithCount[]);
}
