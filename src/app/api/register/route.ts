import { NextRequest, NextResponse } from "next/server";
import { isStudentIdTaken, registerMember } from "@/lib/db";

function displayName(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? p[0] : p[0] + " " + p[p.length - 1][0] + ".";
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length === 1
    ? p[0][0].toUpperCase()
    : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function validate(body: Record<string, unknown>) {
  const name     = typeof body.name   === "string" ? body.name.trim()   : "";
  const sid      = typeof body.sid    === "string" ? body.sid.trim()    : "";
  const email    = typeof body.email  === "string" ? body.email.trim()  : "";
  const course   = typeof body.course === "string" ? body.course.trim() : "";

  if (!name || !sid || !email)        return { error: "Name, student ID and email are required." };
  if (name.length > 120)              return { error: "Name too long." };
  if (sid.length > 20)                return { error: "Student ID too long." };
  if (!email.includes("@") || email.length > 254) return { error: "Enter a valid email." };
  if (course.length > 120)            return { error: "Course name too long." };

  return { name, sid, email, course };
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = validate(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  const { name, sid, email, course } = result;

  try {
    const taken = await isStudentIdTaken(sid);
    if (taken) {
      return NextResponse.json({ error: "That student ID is already registered." }, { status: 409 });
    }

    await registerMember({
      name,
      displayName: displayName(name),
      initials:    initials(name),
      email,
      studentId:   sid,
      course,
    });

    return NextResponse.json({ ok: true, displayName: displayName(name) }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
