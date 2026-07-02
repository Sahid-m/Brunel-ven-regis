"use client";

import React, { useState, useEffect, CSSProperties } from "react";

const C = {
  bg:      "#F8F5F0",
  surface: "#F2EDE6",
  border:  "#E4DDD4",
  dim:     "#C8BFB4",
  text:    "#1C1814",
  muted:   "#8A8178",
  accent:  "#1C1814",
};

const PALETTE = [
  { bg: "#EDE8E0", fg: "#1C1814" },
  { bg: "#E8E3DC", fg: "#1C1814" },
  { bg: "#EAE5DE", fg: "#1C1814" },
  { bg: "#E6E1DA", fg: "#1C1814" },
  { bg: "#ECE7E0", fg: "#1C1814" },
  { bg: "#E4DFD8", fg: "#1C1814" },
];

function avatarColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffff;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

const serif: CSSProperties = { fontFamily: "'Cormorant Garamond', Georgia, serif" };
const sans:  CSSProperties = { fontFamily: "'DM Sans', system-ui, sans-serif" };
const mono:  CSSProperties = { fontFamily: "'DM Mono', monospace" };
const TAG = (color = C.muted): CSSProperties => ({
  ...mono, fontSize: 10, color, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 300,
});

const FOUNDER = {
  name: "Sahid",
  role: "Founding Chair",
  line: "13x hackathon winner · AI Builder Award, UK Gov · ex-YC",
  initials: "S",
};

const IS: { strong: string; rest: string }[] = [
  { strong: "Build nights",        rest: " — ship in one session"   },
  { strong: "AI startup teardowns", rest: ""                        },
  { strong: "Founder AMAs",        rest: ", no polish"             },
  { strong: "Technical and business", rest: " minds, both"         },
];
const ISNT = ["CV workshops", "Networking fluff", "Panels with no output", "A society you ghost after week one"];

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Do I need to know how to code?",
    a: <><strong style={{ color: "#1C1814", fontWeight: 500 }}>No.</strong> Half the best startup founders can&apos;t write a line of code. If you can think clearly about problems and talk to users, you belong here. Engineers need people like you.</>,
  },
  {
    q: "What actually happens at a build night?",
    a: <>You show up, pick something to build (solo or pair up), and <strong style={{ color: "#1C1814", fontWeight: 500 }}>ship it before the night ends</strong>. Could be a landing page, a prototype, a working script. We value <strong style={{ color: "#1C1814", fontWeight: 500 }}>done over polished</strong>.</>,
  },
  {
    q: "How much of a time commitment is this?",
    a: <>As much or as little as you want. <strong style={{ color: "#1C1814", fontWeight: 500 }}>One session a month is fine.</strong> There&apos;s no attendance policy — this isn&apos;t a lecture.</>,
  },
  {
    q: "I'm not at Brunel, can I still join?",
    a: <>The society is Brunel-based but <strong style={{ color: "#1C1814", fontWeight: 500 }}>we don&apos;t turn away good builders</strong>. Reach out directly if you&apos;re local and interested.</>,
  },
  {
    q: "Is there a membership fee?",
    a: <><strong style={{ color: "#1C1814", fontWeight: 500 }}>No fee to sign up.</strong> Some events may have a small cover for venue costs — we&apos;ll always give advance notice.</>,
  },
  {
    q: "What AI tools / stack will we use?",
    a: <><strong style={{ color: "#1C1814", fontWeight: 500 }}>Whatever works.</strong> OpenAI, Claude, Cursor, v0, Replicate — bring your own stack or learn one on the night. We&apos;re tool-agnostic.</>,
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
    // Track visit — fire-and-forget, never blocks render
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: window.location.pathname }),
    }).catch(() => {});

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
    width: "100%", padding: "12px 16px", background: C.surface,
    border: `1px solid ${C.border}`, borderRadius: 4,
    color: C.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    fontWeight: 300, outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', system-ui, sans-serif", lineHeight: 1.55 }}>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 28px" }}>

        {/* Hero */}
        <div style={{ padding: "80px 0 52px" }}>
          {loaded && (
            <div style={{ ...TAG(), marginBottom: 28 }}>
              {members.length > 0
                ? `${members.length} builder${members.length !== 1 ? "s" : ""} in · be one of them`
                : "Be the first to join"}
            </div>
          )}
          <h1 style={{ ...serif, fontSize: "clamp(44px, 10vw, 72px)", fontWeight: 600, lineHeight: 1.0, letterSpacing: "-0.01em", margin: "0 0 24px", color: C.text }}>
            Build real things<br /><em>with AI.</em>
          </h1>
          <p style={{ ...sans, fontSize: 16, color: C.muted, maxWidth: 420, margin: 0, lineHeight: 1.8, fontWeight: 300 }}>
            Brunel&apos;s society for people building{" "}
            <span style={{ color: C.text, fontWeight: 400 }}>AI-powered products and startups</span>.
            Whether you write the code or the business plan —{" "}
            <span style={{ color: C.text, fontWeight: 400 }}>if you&apos;re serious about building, you belong here</span>.
          </p>
        </div>

        {/* Who's starting this */}
        <div style={{ paddingBottom: 52, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ ...TAG(), marginBottom: 20 }}>Who&apos;s starting this</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, background: C.text, color: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>
              {FOUNDER.initials}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                <span style={{ ...sans, fontWeight: 500, fontSize: 14, color: C.text }}>{FOUNDER.name}</span>
                <span style={{ ...mono, fontSize: 9, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 2, padding: "2px 6px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 300 }}>{FOUNDER.role}</span>
              </div>
              <div style={{ ...mono, fontSize: 11, color: C.muted, lineHeight: 1.5, fontWeight: 300 }}>
                <span style={{ color: C.text }}>13x hackathon winner</span>
                {" · "}
                <span style={{ color: C.text }}>AI Builder Award, UK Gov</span>
                {" · ex-YC"}
              </div>
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

            {/* Avatar stack — only shown when there are more members than fit in pills */}
            {members.length > 8 && (
              <div style={{ display: "flex", marginBottom: 14 }}>
                {members.slice(0, 18).map((m, i) => (
                  <div key={i} title={m.display_name} style={{ width: 30, height: 30, borderRadius: "50%", background: C.surface, color: C.text, border: `2px solid ${C.bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif", flexShrink: 0, marginLeft: i === 0 ? 0 : -8, zIndex: members.length - i }}>
                    {m.initials}
                  </div>
                ))}
                {members.length > 18 && (
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.surface, color: C.muted, border: `2px solid ${C.bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600, flexShrink: 0, marginLeft: -8 }}>
                    +{members.length - 18}
                  </div>
                )}
              </div>
            )}

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
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: isNew ? C.bg : C.surface, color: isNew ? C.text : C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif", flexShrink: 0 }}>{m.initials}</div>
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, padding: "52px 0", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <div style={{ ...TAG(), marginBottom: 16 }}>This is</div>
            {IS.map(s => (
              <div key={s.strong} style={{ ...sans, fontSize: 13, color: C.muted, paddingLeft: 14, marginBottom: 11, borderLeft: `1.5px solid ${C.text}`, lineHeight: 1.5 }}>
                <span style={{ color: C.text, fontWeight: 500 }}>{s.strong}</span>{s.rest}
              </div>
            ))}
          </div>
          <div>
            <div style={{ ...TAG(), marginBottom: 16 }}>This isn&apos;t</div>
            {ISNT.map(s => <div key={s} style={{ ...sans, fontSize: 13, color: C.dim, paddingLeft: 14, marginBottom: 11, borderLeft: `1px solid ${C.border}`, lineHeight: 1.5 }}>{s}</div>)}
          </div>
        </div>

        {/* First event teaser */}
        <div style={{ padding: "52px 0", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ ...TAG(), marginBottom: 20 }}>What&apos;s coming</div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "28px 28px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ ...serif, fontWeight: 600, fontSize: 22, color: C.text, marginBottom: 8, lineHeight: 1.2 }}>Build Night #1</div>
                <div style={{ ...sans, fontSize: 13, color: C.muted, lineHeight: 1.8, maxWidth: 300, fontWeight: 300 }}>
                  <span style={{ color: C.text, fontWeight: 400 }}>Ship something in one evening.</span>{" "}
                  Bring an idea or find one on the night.
                  Engineers, designers, and founders all welcome.
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ ...TAG(), marginBottom: 6 }}>Date</div>
                <div style={{ ...sans, fontWeight: 500, fontSize: 14, color: C.text }}>TBC — Term 1</div>
                <div style={{ ...mono, fontSize: 10, color: C.muted, marginTop: 4, fontWeight: 300 }}>Brunel University London</div>
              </div>
            </div>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}`, display: "flex", gap: 28, flexWrap: "wrap" }}>
              {[
                { label: "Format",   value: "In-person", highlight: false },
                { label: "Duration", value: "3 hours",   highlight: false },
                { label: "Cost",     value: "Free",      highlight: true  },
                { label: "Output",   value: "Ship it",   highlight: false },
              ].map(({ label, value, highlight }) => (
                <div key={label}>
                  <div style={{ ...TAG(), marginBottom: 5 }}>{label}</div>
                  <div style={{ ...serif, fontSize: 16, fontWeight: 600, color: C.text, fontStyle: highlight ? "italic" : "normal" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ padding: "52px 0" }}>
          <div style={{ ...TAG(), marginBottom: 20 }}>FAQ</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 16 }}
                  >
                    <span style={{ ...serif, fontSize: 17, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{faq.q}</span>
                    <span style={{ ...serif, fontSize: 22, color: C.dim, flexShrink: 0, transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(45deg)" : "rotate(0deg)", lineHeight: 1 }}>+</span>
                  </button>
                  {open && (
                    <div style={{ ...sans, paddingBottom: 18, fontSize: 14, color: C.muted, lineHeight: 1.85, fontWeight: 300 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: "52px 0 88px" }}>
          {phase === "done" ? (
            <div style={{ textAlign: "center", padding: "56px 0" }}>
              <div style={{ ...TAG(), marginBottom: 20 }}>You&apos;re in</div>
              <div style={{ ...serif, fontSize: 28, fontWeight: 600, marginBottom: 12, color: C.text, lineHeight: 1.2 }}>See you at the first build night.</div>
              <div style={{ ...sans, fontSize: 14, color: C.muted, fontWeight: 300 }}>{members.length} builder{members.length !== 1 ? "s" : ""} and counting.</div>
            </div>
          ) : (
            <>
              <div style={{ ...serif, fontSize: 26, fontWeight: 600, marginBottom: 8, color: C.text, lineHeight: 1.2 }}>Join the society</div>
              <div style={{ ...sans, fontSize: 14, color: C.muted, marginBottom: 32, lineHeight: 1.8, fontWeight: 300 }}>
                Your first name will appear in the members list above —{" "}
                <span style={{ color: C.text, fontWeight: 400 }}>so your friends know you&apos;re in</span>.
              </div>

              {([
                { label: "Full name",          key: "name"   as const, type: "text",  ph: "Your name",               required: true  },
                { label: "Student ID",          key: "sid"    as const, type: "text",  ph: "e.g. 2234567",            required: true  },
                { label: "Email",               key: "email"  as const, type: "email", ph: "you@brunel.ac.uk",        required: true  },
                { label: "Course / Department", key: "course" as const, type: "text",  ph: "e.g. Business, CS, MBA…", required: false },
              ]).map(f => (
                <div key={f.key} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                    <div style={TAG()}>{f.label}</div>
                    {!f.required && <div style={{ ...mono, fontSize: 9, color: C.dim, letterSpacing: "0.08em", fontWeight: 300 }}>optional</div>}
                  </div>
                  <input
                    type={f.type} placeholder={f.ph}
                    value={form[f.key]} onChange={set(f.key)}
                    onKeyDown={e => e.key === "Enter" && submit()}
                    style={inputBase}
                  />
                </div>
              ))}

              {err && <div style={{ ...mono, fontSize: 11, color: "#9B2020", marginBottom: 16, fontWeight: 300 }}>{err}</div>}

              <button
                onClick={submit} disabled={phase === "loading"}
                style={{ width: "100%", padding: "14px 0", background: phase === "loading" ? C.dim : C.text, border: "none", borderRadius: 4, color: C.bg, fontSize: 14, fontWeight: 400, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.04em", cursor: phase === "loading" ? "default" : "pointer", opacity: phase === "loading" ? 0.5 : 1, transition: "opacity 0.15s" }}
              >
                {phase === "loading" ? "Submitting…" : "Join →"}
              </button>
              <div style={{ ...mono, fontSize: 10, color: C.dim, marginTop: 14, textAlign: "center", fontWeight: 300 }}>
                First name and last initial appear publicly. Student ID and email are private.
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "20px 28px" }}>
        <span style={{ ...mono, fontSize: 10, color: C.dim, fontWeight: 300, letterSpacing: "0.1em" }}>BRUNEL AI VENTURES · {new Date().getFullYear()}</span>
      </div>

    </div>
  );
}
