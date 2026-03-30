import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    password?: string;
  };
  const password = body.password;

  if (
    typeof password !== "string" ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set("admin_token", password, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
