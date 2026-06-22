function getScoreColor(score: number): string {
  if (score >= 80) return "var(--sage)";
  if (score >= 50) return "var(--amber)";
  return "var(--deep-red)";
}

const Summary = ({ feedback }: { feedback: Feedback }) => {
  const score = feedback.overallScore;

  return (
    <div>
      {/* Large score display */}
      <div className="mb-6">
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "5rem",
            fontWeight: 900,
            lineHeight: 1,
            color: getScoreColor(score),
          }}
        >
          {score}
        </span>
        <p
          className="mt-1"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6875rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "var(--muted)",
          }}
        >
          Overall Score
        </p>
        <div
          className="mt-3"
          style={{
            width: "60px",
            height: "2px",
            backgroundColor: getScoreColor(score),
          }}
        />
      </div>

      {/* ATS score bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6875rem",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--muted)",
            }}
          >
            ATS Compatibility
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: getScoreColor(feedback.ATS?.score || 0),
            }}
          >
            {feedback.ATS?.score || 0}%
          </span>
        </div>
        <div
          className="w-full h-1.5"
          style={{
            backgroundColor: "var(--raised)",
            borderRadius: "1px",
          }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${feedback.ATS?.score || 0}%`,
              backgroundColor: "var(--rust)",
              borderRadius: "1px",
            }}
          />
        </div>
      </div>

      {/* Category scores */}
      {[
        { label: "Tone & Style", score: feedback.toneAndStyle.score },
        { label: "Content", score: feedback.content.score },
        { label: "Structure", score: feedback.structure.score },
        { label: "Skills", score: feedback.skills.score },
      ].map((cat) => (
        <div
          key={cat.label}
          className="flex items-center justify-between py-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              fontWeight: 400,
              color: "var(--stone)",
            }}
          >
            {cat.label}
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: getScoreColor(cat.score),
            }}
          >
            {cat.score}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Summary;
