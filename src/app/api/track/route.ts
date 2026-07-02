import { NextRequest, NextResponse } from "next/server";
import { recordVisit } from "@/lib/db";

// Extracts the real client IP, working behind Vercel / Cloudflare proxies.
function getIp(req: NextRequest): string | null {
  return (
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    null
  );
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* ignore — body is optional */ }

  const path = typeof body.path === "string" ? body.path.slice(0, 255) : "/";

  // Vercel injects these geo headers automatically on their edge network.
  const visit = {
    ip:         getIp(req),
    country:    req.headers.get("x-vercel-ip-country"),
    city:       req.headers.get("x-vercel-ip-city"),
    region:     req.headers.get("x-vercel-ip-country-region"),
    referrer:   (req.headers.get("referer") ?? "").slice(0, 500) || null,
    user_agent: (req.headers.get("user-agent") ?? "").slice(0, 500) || null,
    path,
  };

  // Fire-and-forget — never block the response on DB latency.
  recordVisit(visit).catch(() => {});

  return NextResponse.json({ ok: true });
}
