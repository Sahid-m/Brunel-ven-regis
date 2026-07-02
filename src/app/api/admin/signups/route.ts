import { NextRequest, NextResponse } from "next/server";
import { getSignups } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim() : "";

  // Constant-time comparison to prevent timing attacks
  const expected = process.env.ADMIN_CODE ?? "";
  if (code.length !== expected.length || code !== expected) {
    return NextResponse.json({ error: "Wrong code." }, { status: 403 });
  }

  try {
    const signups = await getSignups();
    return NextResponse.json({ signups });
  } catch (err) {
    console.error("[admin/signups]", err);
    return NextResponse.json({ error: "Failed to load sign-ups." }, { status: 500 });
  }
}
