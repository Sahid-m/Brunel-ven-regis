"use client";

import { useState, useEffect, CSSProperties } from "react";

const C = {
  bg:      "#FFFFFF",
  surface: "#F7F7F7",
  border:  "#E8E8E8",
  dim:     "#D0D0D0",
  text:    "#0A0A0A",
  muted:   "#767676",
  accent:  "#0A0A0A",
};

const PALETTE = [
  { bg: "#F0F0F0", fg: "#0A0A0A" },
  { bg: "#E8E8E8", fg: "#0A0A0A" },
  { bg: "#EFEFEF", fg: "#0A0A0A" },
  { bg: "#E5E5E5", fg: "#0A0A0A" },
  { bg: "#EDEDED", fg: "#0A0A0A" },
  { bg: "#EAEAEA", fg: "#0A0A0A" },
];

function avatarColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffff;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

const mono: CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };
const disp: CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };
const TAG = (color = C.muted): CSSProperties => ({
  ...mono, fontSize: 10, color, letterSpacing: "0.13em", textTransform: "uppercase",
});

const FOUNDER = {
  name: "Sahid",
  role: "Founding Chair",
  line: "13x hackathon winner · AI Builder Award, UK Gov · ex-YC",
  initials: "S",
};

const IS   = ["Build nights — ship in one session", "AI startup teardowns", "Founder AMAs, no polish", "Technical and business minds, both"];
const ISNT = ["CV workshops", "Networking fluff", "Panels with no output", "A society you ghost after week one"];

const FAQS = [
  {
    q: "Do I need to know how to code?",
    a: "No. Half the best startup founders can't write a line of code. If you can think clearly about problems and talk to users, you belong here. Engineers need people like you.",
  },
  {
    q: "What actually happens at a build night?",
    a: "You show up, pick something to build (solo or pair up), and ship it before the night ends. Could be a landing page, a prototype, a working script. We value done over polished.",
  },
  {
    q: "How much of a time commitment is this?",
    a: "As much or as little as you want. One session a month is fine. There's no attendance policy — this isn't a lecture.",
  },
  {
    q: "I'm not at Brunel, can I still join?",
    a: "The society is Brunel-based but we don't turn away good builders. Reach out directly if you're local and interested.",
  },
  {
    q: "Is there a membership fee?",
    a: "No fee to sign up. Some events may have a small cover for venue costs — we'll always give advance notice.",
  },
  {
    q: "What AI tools / stack will we use?",
    a: "Whatever works. OpenAI, Claude, Cursor, v0, Replicate — bring your own stack or learn one on the night. We're tool-agnostic.",
  },
];

interface Member { display_name: string; initials: string; created_at: string }

export default function BAV() {
  const [members,   setMembers]   = useState<Member[]>([]);
  const [loaded,    setLoaded]    = useState(false);
  const [form,      setForm]      = useState({ name: "", sid: "", email: "", course: "" });
  const [phase,     setPhase]     = useState<"form" | "loading" | "done">("form");
  const [err,       setErr]       = useState("");
  const [freshName, setFreshName] = useState<string | null>(null);
  const [openFaq,   setOpenFaq]   = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/members")
      .then(r => r.json())
      .then(data => { if (data.members) setMembers(data.members); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErr("");
  };

  async function submit() {
    const { name, sid, email, course } = form;
    if (!name.trim() || !sid.trim() || !email.trim()) { setErr("Name, student ID and email are required."); return; }
    if (!email.includes("@")) { setErr("Enter a valid email."); return; }

    setPhase("loading");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sid, email, course }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErr(data.error ?? "Something went wrong. Please try again.");
        setPhase("form");
        return;
      }

      setFreshName(data.displayName);
      setMembers(prev => [...prev, { display_name: data.displayName, initials: data.displayName[0].toUpperCase(), created_at: new Date().toISOString() }]);
      setPhase("done");
    } catch {
      setErr("Network error. Please try again.");
      setPhase("form");
    }
  }

  const inputBase: CSSProperties = {
    width: "100%", padding: "12px 16px", background: C.bg,
    border: `1px solid ${C.border}`, borderRadius: 6,
    color: C.text, fontSize: 15, fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "Inter, system-ui, sans-serif", lineHeight: 1.55 }}>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px" }}>

        {/* Hero */}
        <div style={{ padding: "72px 0 48px" }}>
          {loaded && (
            <div style={{ ...TAG(), marginBottom: 24 }}>
              {members.length > 0
                ? `${members.length} builder${members.length !== 1 ? "s" : ""} in · be one of them`
                : "Be the first to join"}
            </div>
          )}
          <h1 style={{ ...disp, fontSize: "clamp(38px, 9vw, 60px)", fontWeight: 700, lineHeight: 1.06, letterSpacing: "-0.03em", margin: "0 0 20px", color: C.text }}>
            Build real things<br />with AI.
          </h1>
          <p style={{ fontSize: 16, color: C.muted, maxWidth: 440, margin: 0, lineHeight: 1.75 }}>
            Brunel&apos;s society for people building AI-powered products and startups.
            Whether you write the code or the business plan — if you&apos;re serious about building, you belong here.
          </p>
        </div>

        {/* Who's starting this */}
        <div style={{ paddingBottom: 48, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ ...TAG(), marginBottom: 16 }}>Who&apos;s starting this</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: C.text, color: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
              {FOUNDER.initials}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ ...disp, fontWeight: 600, fontSize: 14, color: C.text }}>{FOUNDER.name}</span>
                <span style={{ ...mono, fontSize: 9, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 3, padding: "2px 6px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{FOUNDER.role}</span>
              </div>
              <div style={{ ...mono, fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{FOUNDER.line}</div>
            </div>
          </div>
        </div>

        {/* Who's in */}
        {loaded && members.length > 0 && (
          <div style={{ padding: "48px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
              <div style={TAG()}>Who&apos;s in</div>
              <div style={{ ...mono, fontSize: 10, color: C.dim }}>{members.length} member{members.length !== 1 ? "s" : ""}</div>
            </div>

            {/* Avatar stack */}
            <div style={{ display: "flex", marginBottom: 14 }}>
              {members.slice(0, 18).map((m, i) => (
                <div key={i} title={m.display_name} style={{ width: 30, height: 30, borderRadius: "50%", background: C.surface, color: C.text, border: `2px solid ${C.bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0, marginLeft: i === 0 ? 0 : -8, zIndex: members.length - i }}>
                  {m.initials}
                </div>
              ))}
              {members.length > 18 && (
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.surface, color: C.muted, border: `2px solid ${C.bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600, flexShrink: 0, marginLeft: -8 }}>
                  +{members.length - 18}
                </div>
              )}
            </div>

            {/* Recent pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[...members]
                .reverse()
                .filter((m, i) => i < 8 || (freshName && m.display_name === freshName))
                .slice(0, 9)
                .map((m, i) => {
                  const isNew = freshName && m.display_name === freshName;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: isNew ? C.text : C.surface, border: `1px solid ${isNew ? C.text : C.border}`, borderRadius: 20, padding: "3px 10px 3px 4px" }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: isNew ? C.bg : C.dim, color: isNew ? C.text : C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0 }}>{m.initials}</div>
                      <span style={{ fontSize: 12, color: isNew ? C.bg : C.muted, whiteSpace: "nowrap" }}>{m.display_name}</span>
                      {isNew && <span style={{ ...mono, fontSize: 8, color: C.dim, letterSpacing: "0.08em" }}>you</span>}
                    </div>
                  );
                })}
              {members.length > 8 && (
                <div style={{ display: "flex", alignItems: "center", padding: "3px 10px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20 }}>
                  <span style={{ ...mono, fontSize: 10, color: C.muted }}>+{members.length - 8} more</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* This is / Isn't */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, padding: "48px 0", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <div style={{ ...TAG(), marginBottom: 14 }}>This is</div>
            {IS.map(s => <div key={s} style={{ fontSize: 13, color: C.text, paddingLeft: 12, marginBottom: 10, borderLeft: `2px solid ${C.text}` }}>{s}</div>)}
          </div>
          <div>
            <div style={{ ...TAG(), marginBottom: 14 }}>This isn&apos;t</div>
            {ISNT.map(s => <div key={s} style={{ fontSize: 13, color: C.dim, paddingLeft: 12, marginBottom: 10, borderLeft: `1px solid ${C.border}` }}>{s}</div>)}
          </div>
        </div>

        {/* First event teaser */}
        <div style={{ padding: "48px 0", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ ...TAG(), marginBottom: 20 }}>What&apos;s coming</div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ ...disp, fontWeight: 700, fontSize: 17, color: C.text, marginBottom: 6 }}>Build Night #1</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, maxWidth: 320 }}>
                  Ship something in one evening. Bring an idea or find one on the night.
                  Engineers, designers, and founders all welcome.
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ ...TAG(), marginBottom: 4 }}>Date</div>
                <div style={{ ...disp, fontWeight: 600, fontSize: 14, color: C.text }}>TBC — Term 1</div>
                <div style={{ ...mono, fontSize: 10, color: C.muted, marginTop: 4 }}>Brunel University London</div>
              </div>
            </div>
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.border}`, display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[
                { label: "Format",   value: "In-person" },
                { label: "Duration", value: "3 hours"   },
                { label: "Cost",     value: "Free"       },
                { label: "Output",   value: "Ship it"    },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ ...TAG(), marginBottom: 4 }}>{label}</div>
                  <div style={{ ...disp, fontSize: 13, fontWeight: 600, color: C.text }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ padding: "48px 0", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ ...TAG(), marginBottom: 20 }}>FAQ</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 16 }}
                  >
                    <span style={{ ...disp, fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{faq.q}</span>
                    <span style={{ fontSize: 18, color: C.muted, flexShrink: 0, transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(45deg)" : "rotate(0deg)", lineHeight: 1 }}>+</span>
                  </button>
                  {open && (
                    <div style={{ paddingBottom: 16, fontSize: 13, color: C.muted, lineHeight: 1.8 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: "48px 0 80px" }}>
          {phase === "done" ? (
            <div style={{ textAlign: "center", padding: "52px 0" }}>
              <div style={{ ...TAG(), marginBottom: 16 }}>You&apos;re in</div>
              <div style={{ ...disp, fontSize: 22, fontWeight: 700, marginBottom: 10, color: C.text }}>See you at the first build night.</div>
              <div style={{ fontSize: 14, color: C.muted }}>{members.length} builder{members.length !== 1 ? "s" : ""} and counting.</div>
            </div>
          ) : (
            <>
              <div style={{ ...disp, fontSize: 20, fontWeight: 700, marginBottom: 6, color: C.text }}>Join the society</div>
              <div style={{ fontSize: 14, color: C.muted, marginBottom: 28, lineHeight: 1.7 }}>
                Your first name will appear in the members list above — so your friends know you&apos;re in.
              </div>

              {([
                { label: "Full name",          key: "name"   as const, type: "text",  ph: "Your name",               required: true  },
                { label: "Student ID",          key: "sid"    as const, type: "text",  ph: "e.g. 2234567",            required: true  },
                { label: "Email",               key: "email"  as const, type: "email", ph: "you@brunel.ac.uk",        required: true  },
                { label: "Course / Department", key: "course" as const, type: "text",  ph: "e.g. Business, CS, MBA…", required: false },
              ]).map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={TAG()}>{f.label}</div>
                    {!f.required && <div style={{ ...mono, fontSize: 9, color: C.dim, letterSpacing: "0.08em" }}>optional</div>}
                  </div>
                  <input
                    type={f.type} placeholder={f.ph}
                    value={form[f.key]} onChange={set(f.key)}
                    onKeyDown={e => e.key === "Enter" && submit()}
                    style={inputBase}
                  />
                </div>
              ))}

              {err && <div style={{ ...mono, fontSize: 12, color: "#CC0000", marginBottom: 14 }}>{err}</div>}

              <button
                onClick={submit} disabled={phase === "loading"}
                style={{ width: "100%", padding: "13px 0", background: phase === "loading" ? C.dim : C.text, border: "none", borderRadius: 6, color: C.bg, fontSize: 14, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", cursor: phase === "loading" ? "default" : "pointer", opacity: phase === "loading" ? 0.5 : 1, transition: "opacity 0.15s" }}
              >
                {phase === "loading" ? "Submitting…" : "Join →"}
              </button>
              <div style={{ ...mono, fontSize: 10, color: C.dim, marginTop: 12, textAlign: "center" }}>
                First name and last initial appear publicly. Student ID and email are private.
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "18px 24px" }}>
        <span style={{ ...mono, fontSize: 10, color: C.dim }}>BRUNEL AI VENTURES · {new Date().getFullYear()}</span>
      </div>

    </div>
  );
}
