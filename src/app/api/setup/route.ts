import { NextRequest, NextResponse } from "next/server";
import { createTablesIfNotExist } from "@/lib/db";

// One-time table initialisation endpoint.
// Protected by ADMIN_CODE so it can't be triggered by anyone else.
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const code     = typeof body.code === "string" ? body.code.trim() : "";
  const expected = process.env.ADMIN_CODE ?? "";

  if (code.length !== expected.length || code !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    await createTablesIfNotExist();
    return NextResponse.json({ ok: true, message: "Tables ready." });
  } catch (err) {
    console.error("[setup]", err);
    return NextResponse.json({ error: "Setup failed." }, { status: 500 });
  }
}
