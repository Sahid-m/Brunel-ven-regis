"use client";

import { useState, useEffect, CSSProperties } from "react";

const C = {
  bg:      "#0B0B14",
  surface: "#0F0F1C",
  border:  "#1C1C32",
  dim:     "#2A2A48",
  text:    "#EEEEF8",
  muted:   "#64649A",
  accent:  "#5B6EF7",
};

const PALETTE = [
  { bg: "#1A2860", fg: "#7B9FFF" },
  { bg: "#1A3828", fg: "#4ECBA0" },
  { bg: "#38183C", fg: "#C47BFF" },
  { bg: "#38281A", fg: "#FFB87B" },
  { bg: "#1A3838", fg: "#7BDFFF" },
  { bg: "#38181A", fg: "#FF8B8B" },
];

function avatarColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffff;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

const mono: CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };
const disp: CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };
const TAG = (color = C.accent): CSSProperties => ({
  ...mono, fontSize: 11, color, letterSpacing: "0.13em", textTransform: "uppercase",
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
  const [members,       setMembers]       = useState<Member[]>([]);
  const [loaded,        setLoaded]        = useState(false);
  const [form,          setForm]          = useState({ name: "", sid: "", email: "", course: "" });
  const [phase,         setPhase]         = useState<"form" | "loading" | "done">("form");
  const [err,           setErr]           = useState("");
  const [freshName,     setFreshName]     = useState<string | null>(null);
  const [openFaq,       setOpenFaq]       = useState<number | null>(null);


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
    width: "100%", padding: "12px 16px", background: "#08080F",
    border: `1px solid ${C.border}`, borderRadius: 8,
    color: C.text, fontSize: 15, fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
  };

  const founderCol = avatarColor(FOUNDER.initials);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "Inter, system-ui, sans-serif", lineHeight: 1.55 }}>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px" }}>

        {/* Hero */}
        <div style={{ padding: "64px 0 40px" }}>
          {loaded && (
            <div style={{ ...TAG(C.accent), marginBottom: 20 }}>
              {members.length > 0
                ? `${members.length} builder${members.length !== 1 ? "s" : ""} in · be one of them`
                : "Be the first to join"}
            </div>
          )}
          <h1 style={{ ...disp, fontSize: "clamp(40px, 9vw, 64px)", fontWeight: 700, lineHeight: 1.06, letterSpacing: "-0.03em", margin: "0 0 20px", color: C.text }}>
            Build real things<br />
            <span style={{ color: C.accent }}>with AI.</span>
          </h1>
          <p style={{ fontSize: 16, color: C.muted, maxWidth: 460, margin: 0, lineHeight: 1.7 }}>
            Brunel&apos;s society for people building AI-powered products and startups.
            Whether you write the code or the business plan — if you&apos;re serious about building, you belong here.
          </p>
        </div>

        {/* Who's starting this */}
        <div style={{ paddingBottom: 48, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ ...TAG(C.muted), marginBottom: 16 }}>Who&apos;s starting this</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: founderCol.bg, color: founderCol.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
              {FOUNDER.initials}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ ...disp, fontWeight: 600, fontSize: 15, color: C.text }}>{FOUNDER.name}</span>
                <span style={{ ...mono, fontSize: 10, color: C.accent, border: `1px solid ${C.dim}`, borderRadius: 4, padding: "2px 7px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{FOUNDER.role}</span>
              </div>
              <div style={{ ...mono, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{FOUNDER.line}</div>
            </div>
          </div>
        </div>

        {/* Who's in */}
        {loaded && members.length > 0 && (
          <div style={{ padding: "48px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
              <div style={TAG(C.muted)}>Who&apos;s in</div>
              <div style={{ ...mono, fontSize: 11, color: C.dim }}>{members.length} member{members.length !== 1 ? "s" : ""}</div>
            </div>

            {/* Avatar stack — always visible */}
            <div style={{ display: "flex", marginBottom: 12 }}>
              {members.slice(0, 18).map((m, i) => {
                const col = avatarColor((m.initials ?? "?") + i);
                return (
                  <div key={i} title={m.display_name} style={{ width: 32, height: 32, borderRadius: "50%", background: col.bg, color: col.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0, marginLeft: i === 0 ? 0 : -8, border: `2px solid ${C.bg}`, zIndex: members.length - i }}>
                    {m.initials}
                  </div>
                );
              })}
              {members.length > 18 && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.dim, color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0, marginLeft: -8, border: `2px solid ${C.bg}` }}>
                  +{members.length - 18}
                </div>
              )}
            </div>

            {/* Recent joiners as pills (last 8, newest first) — always show the fresh one */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[...members]
                .reverse()
                .filter((m, i) => i < 8 || (freshName && m.display_name === freshName))
                .slice(0, 9)
                .map((m, i) => {
                  const col  = avatarColor((m.initials ?? "?") + members.indexOf(m));
                  const isNew = freshName && m.display_name === freshName;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: C.surface, border: `1px solid ${isNew ? C.accent : C.border}`, borderRadius: 24, padding: "4px 10px 4px 4px" }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: col.bg, color: col.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0 }}>{m.initials}</div>
                      <span style={{ fontSize: 12, color: isNew ? C.text : "#9090B8", whiteSpace: "nowrap" }}>{m.display_name}</span>
                      {isNew && <span style={{ ...mono, fontSize: 9, color: C.accent, letterSpacing: "0.08em" }}>you</span>}
                    </div>
                  );
                })}
              {members.length > 8 && (
                <div style={{ display: "flex", alignItems: "center", padding: "4px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 24 }}>
                  <span style={{ ...mono, fontSize: 11, color: C.dim }}>+{members.length - 8} more</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* This is / Isn't */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, padding: "48px 0", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <div style={{ ...TAG(C.accent), marginBottom: 14 }}>This is</div>
            {IS.map(s => <div key={s} style={{ fontSize: 13, color: "#A8A8CC", paddingLeft: 12, marginBottom: 10, borderLeft: `1px solid ${C.dim}` }}>{s}</div>)}
          </div>
          <div>
            <div style={{ ...TAG("#383858"), marginBottom: 14 }}>This isn&apos;t</div>
            {ISNT.map(s => <div key={s} style={{ fontSize: 13, color: "#34344C", paddingLeft: 12, marginBottom: 10, borderLeft: "1px solid #16161E" }}>{s}</div>)}
          </div>
        </div>

        {/* First event teaser */}
        <div style={{ padding: "48px 0", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ ...TAG(C.muted), marginBottom: 20 }}>What&apos;s coming</div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ ...disp, fontWeight: 700, fontSize: 18, color: C.text, marginBottom: 6 }}>
                  Build Night #1
                </div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, maxWidth: 360 }}>
                  Ship something in one evening. Bring an idea or find one on the night.
                  Engineers, designers, and founders all welcome.
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ ...mono, fontSize: 11, color: C.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Date</div>
                <div style={{ ...disp, fontWeight: 600, fontSize: 15, color: C.text }}>TBC — Term 1</div>
                <div style={{ ...mono, fontSize: 11, color: C.muted, marginTop: 4 }}>Brunel University London</div>
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
                  <div style={{ ...mono, fontSize: 10, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
                  <div style={{ ...disp, fontSize: 14, fontWeight: 600, color: C.text }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ padding: "48px 0", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ ...TAG(C.muted), marginBottom: 20 }}>FAQ</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={i}
                  style={{ background: open ? C.surface : "transparent", border: `1px solid ${open ? C.border : "transparent"}`, borderRadius: 8, overflow: "hidden", transition: "background 0.15s" }}
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 16 }}
                  >
                    <span style={{ ...disp, fontSize: 14, fontWeight: 600, color: open ? C.text : "#A8A8CC", lineHeight: 1.4 }}>{faq.q}</span>
                    <span style={{ ...mono, fontSize: 16, color: open ? C.accent : C.dim, flexShrink: 0, transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
                  </button>
                  {open && (
                    <div style={{ padding: "0 16px 16px", fontSize: 13, color: C.muted, lineHeight: 1.75, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: "44px 0 64px" }}>
          {phase === "done" ? (
            <div style={{ textAlign: "center", padding: "52px 0" }}>
              <div style={{ ...TAG("#10B981"), marginBottom: 16 }}>You&apos;re in</div>
              <div style={{ ...disp, fontSize: 24, fontWeight: 600, marginBottom: 10 }}>See you at the first build night.</div>
              <div style={{ fontSize: 14, color: C.muted }}>{members.length} builder{members.length !== 1 ? "s" : ""} and counting.</div>
            </div>
          ) : (
            <>
              <div style={{ ...disp, fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Join the society</div>
              <div style={{ fontSize: 14, color: C.muted, marginBottom: 28, lineHeight: 1.65 }}>
                Your first name will appear in the members list above — so your friends know you&apos;re in.
              </div>

              {([
                { label: "Full name",          key: "name"   as const, type: "text",  ph: "Your name",               required: true  },
                { label: "Student ID",          key: "sid"    as const, type: "text",  ph: "e.g. 2234567",            required: true  },
                { label: "Email",               key: "email"  as const, type: "email", ph: "you@brunel.ac.uk",        required: true  },
                { label: "Course / Department", key: "course" as const, type: "text",  ph: "e.g. Business, CS, MBA…", required: false },
              ]).map(f => (
                <div key={f.key} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                    <div style={TAG(C.muted)}>{f.label}</div>
                    {!f.required && <div style={{ ...mono, fontSize: 10, color: "#30304A", letterSpacing: "0.08em" }}>optional</div>}
                  </div>
                  <input
                    type={f.type} placeholder={f.ph}
                    value={form[f.key]} onChange={set(f.key)}
                    onKeyDown={e => e.key === "Enter" && submit()}
                    style={inputBase}
                  />
                </div>
              ))}

              {err && <div style={{ ...mono, fontSize: 12, color: "#EF4444", marginBottom: 14 }}>{err}</div>}

              <button
                onClick={submit} disabled={phase === "loading"}
                style={{ width: "100%", padding: "14px 0", background: phase === "loading" ? C.dim : C.accent, border: "none", borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", cursor: phase === "loading" ? "default" : "pointer", opacity: phase === "loading" ? 0.65 : 1, transition: "opacity 0.2s, background 0.2s" }}
              >
                {phase === "loading" ? "Submitting…" : "Join →"}
              </button>
              <div style={{ ...mono, fontSize: 11, color: "#30304A", marginTop: 14, textAlign: "center" }}>
                First name and last initial appear publicly. Student ID and email are private.
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "18px 32px" }}>
        <span style={{ ...mono, fontSize: 10, color: "#22223A" }}>BRUNEL AI VENTURES · {new Date().getFullYear()}</span>
      </div>

    </div>
  );
}
