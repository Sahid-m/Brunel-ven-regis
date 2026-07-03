import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(process.env.DATABASE_URL);

export function getUniversity(): string {
  return process.env.UNIVERSITY ?? "brunel";
}

export interface Member {
  display_name: string;
  initials: string;
  created_at: string;
}

export async function getMemberCount(): Promise<number> {
  const u = getUniversity();
  const rows = await sql`SELECT COUNT(*)::int AS count FROM members WHERE university = ${u}`;
  return rows[0].count as number;
}

export async function getPublicMembers(): Promise<Member[]> {
  const u = getUniversity();
  return (await sql`
    SELECT display_name, initials, created_at
    FROM members
    WHERE university = ${u}
    ORDER BY created_at ASC
  `) as Member[];
}

export async function isStudentIdTaken(studentId: string): Promise<boolean> {
  const u = getUniversity();
  const rows = await sql`
    SELECT 1 FROM signups WHERE student_id = ${studentId} AND university = ${u} LIMIT 1
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
  const u = getUniversity();
  await sql`
    INSERT INTO members (display_name, initials, university)
    VALUES (${displayName}, ${initials}, ${u})
  `;
  await sql`
    INSERT INTO signups (name, email, student_id, course, university)
    VALUES (${name}, ${email}, ${studentId}, ${course || null}, ${u})
  `;
}

export interface PageVisit {
  ip:         string | null;
  country:    string | null;
  city:       string | null;
  region:     string | null;
  referrer:   string | null;
  user_agent: string | null;
  path:       string;
}

export async function recordVisit(v: PageVisit) {
  await sql`
    INSERT INTO page_visits (ip, country, city, region, referrer, user_agent, path)
    VALUES (${v.ip}, ${v.country}, ${v.city}, ${v.region}, ${v.referrer}, ${v.user_agent}, ${v.path})
  `;
}
