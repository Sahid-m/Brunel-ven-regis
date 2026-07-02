import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// sql is a tagged template literal — every interpolated value becomes a
// parameterized placeholder ($1, $2, …). Raw string concatenation is
// intentionally not possible through this interface.
export const sql = neon(process.env.DATABASE_URL);

export interface Member {
  display_name: string;
  initials: string;
  created_at: string;
}

// ── Query helpers ────────────────────────────────────────────────────────────
// Every function uses parameterized tagged-template literals.
// No user input is ever interpolated as raw SQL.

export async function getMemberCount(): Promise<number> {
  const rows = await sql`SELECT COUNT(*)::int AS count FROM members`;
  return rows[0].count as number;
}

export async function getPublicMembers(): Promise<Member[]> {
  return (await sql`
    SELECT display_name, initials, created_at
    FROM members
    ORDER BY created_at ASC
  `) as Member[];
}

export async function isStudentIdTaken(studentId: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM signups WHERE student_id = ${studentId} LIMIT 1
  `;
  return rows.length > 0;
}

export async function registerMember(params: {
  name: string;
  displayName: string;
  initials: string;
  email: string;
  studentId: string;
  course: string;
}) {
  const { name, displayName, initials, email, studentId, course } = params;
  await sql`
    INSERT INTO members (display_name, initials)
    VALUES (${displayName}, ${initials})
  `;
  await sql`
    INSERT INTO signups (name, email, student_id, course)
    VALUES (${name}, ${email}, ${studentId}, ${course || null})
  `;
}

