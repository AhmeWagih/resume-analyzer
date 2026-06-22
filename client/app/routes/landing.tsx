import type { Route } from "./+types/home";
import { Link } from "react-router";
import Navbar from "~/components/Navbar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume Analyzer — Your Resume, Seen Clearly" },
    {
      name: "description",
      content:
        "AI-powered resume analysis. Upload your PDF, paste a job description, and get ATS scoring with structured feedback in under 30 seconds.",
    },
  ];
}

const features = [
  {
    idx: "01",
    title: "ATS Compatibility Score",
    desc: "Know exactly how your resume performs against applicant tracking systems.",
  },
  {
    idx: "02",
    title: "Tone & Style Analysis",
    desc: "Evaluate your resume's voice — professional, confident, and role-appropriate.",
  },
  {
    idx: "03",
    title: "Content Relevance Check",
    desc: "Match your experience against the job description with precision.",
  },
  {
    idx: "04",
    title: "Structure Review",
    desc: "Assess formatting, section order, and readability for maximum impact.",
  },
  {
    idx: "05",
    title: "Skills Gap Detection",
    desc: "See which required skills you have and which ones are missing.",
  },
  {
    idx: "06",
    title: "Actionable Suggestions",
    desc: "Receive specific, practical tips — not vague generalities.",
  },
];

const steps = [
  {
    num: "1",
    title: "Upload Your Resume",
    desc: "Drop a PDF file and paste the job description you're targeting.",
  },
  {
    num: "2",
    title: "AI Analysis",
    desc: "Claude AI reads your resume against the job requirements in seconds.",
  },
  {
    num: "3",
    title: "Get Your Score",
    desc: "Review your ATS score, category breakdowns, and improvement tips.",
  },
];

export default function Landing() {
  return (
    <div style={{ backgroundColor: "var(--ink)", minHeight: "100vh" }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────── */}
      <section
        className="grain relative overflow-hidden"
        style={{ minHeight: "90vh" }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 pt-20 lg:pt-32 pb-20">
          {/* Left content */}
          <div className="flex-1 max-w-2xl">
            <p
              className="mb-6"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.6875rem",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "var(--muted)",
              }}
            >
              Resume Analysis / AI-Powered
            </p>

            <h1 className="mb-6">
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.5rem, 6vw, 5rem)",
                  fontWeight: 900,
                  lineHeight: 1.05,
                  color: "var(--stone)",
                  display: "block",
                }}
              >
                Your Resume,
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.5rem, 6vw, 5rem)",
                  fontWeight: 900,
                  fontStyle: "italic",
                  lineHeight: 1.05,
                  color: "var(--rust)",
                  display: "block",
                }}
              >
                Seen Clearly.
              </span>
            </h1>

            <p
              className="mb-10 max-w-md"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1.0625rem",
                lineHeight: 1.7,
                color: "var(--muted)",
              }}
            >
              Upload your PDF, paste the job description, and receive
              structured ATS scoring with actionable feedback — in under 30
              seconds.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/upload" className="btn-primary">
                Analyze Your Resume
              </Link>
              <Link to="/auth" className="btn-ghost">
                Create Account
              </Link>
            </div>
          </div>

          {/* Right — Score title card */}
          <div className="flex-shrink-0">
            <div
              className="flex flex-col items-center justify-center"
              style={{
                width: "280px",
                height: "320px",
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "0.25rem",
                boxShadow: "0 2px 12px rgba(0,0,0,0.6)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "7rem",
                  fontWeight: 900,
                  lineHeight: 1,
                  color: "var(--stone)",
                }}
              >
                87
              </span>
              <p
                className="mt-2"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "var(--muted)",
                }}
              >
                ATS Score
              </p>
              <div
                className="mt-4"
                style={{
                  width: "60px",
                  height: "2px",
                  backgroundColor: "var(--rust)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom stat line */}
        <div
          className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-10"
        >
          <div style={{ borderTop: "1px solid var(--border)" }} className="pt-6 flex flex-wrap gap-8">
            {["< 30s Analysis", "PDF Native", "Claude AI"].map((stat) => (
              <span
                key={stat}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  fontWeight: 400,
                  color: "var(--muted)",
                  letterSpacing: "0.04em",
                }}
              >
                {stat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <p
          className="mb-12"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6875rem",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "var(--muted)",
          }}
        >
          What It Does
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0">
          {features.map((f) => (
            <div
              key={f.idx}
              className="py-8"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--rust)",
                }}
              >
                {f.idx}
              </span>
              <h3
                className="mt-3 mb-2"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--stone)",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.875rem",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <p
          className="mb-12"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6875rem",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "var(--muted)",
          }}
        >
          The Process
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="py-8 md:px-8 first:md:pl-0 last:md:pr-0"
              style={{
                borderLeft:
                  i > 0 ? "1px solid var(--border)" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "3rem",
                  fontWeight: 300,
                  color: "var(--stone)",
                  lineHeight: 1,
                  display: "block",
                }}
              >
                {s.num}
              </span>
              <h3
                className="mt-4 mb-2"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--stone)",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.875rem",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                }}
              >
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section
        style={{ backgroundColor: "var(--raised)" }}
        className="py-20"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 700,
              color: "var(--stone)",
              lineHeight: 1.2,
            }}
          >
            Ready to see your
            <br />
            resume differently?
          </h2>
          <Link to="/upload" className="btn-primary" style={{ flexShrink: 0 }}>
            Start Your Analysis
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────── */}
      <footer
        style={{
          backgroundColor: "var(--surface)",
          borderTop: "1px solid var(--border)",
        }}
        className="py-8"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "var(--stone)",
            }}
          >
            Resume Analyzer
          </span>

          <div className="flex items-center gap-6">
            {[
              { to: "/dashboard", label: "Dashboard" },
              { to: "/upload", label: "Upload" },
              { to: "/auth", label: "Sign In" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="no-underline transition-colors"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8125rem",
                  color: "var(--muted)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--stone)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--muted)")
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              color: "var(--muted)",
            }}
          >
            © {new Date().getFullYear()} Resume Analyzer
          </span>
        </div>
      </footer>
    </div>
  );
}
