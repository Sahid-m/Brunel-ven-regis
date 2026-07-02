import { NextResponse } from "next/server";
import { getPublicMembers } from "@/lib/db";

export async function GET() {
  try {
    const members = await getPublicMembers();
    return NextResponse.json({ members });
  } catch (err) {
    console.error("[members]", err);
    return NextResponse.json({ error: "Failed to load members." }, { status: 500 });
  }
}
