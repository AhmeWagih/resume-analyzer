import React from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

function getScoreColor(score: number): string {
  if (score >= 80) return "var(--sage)";
  if (score >= 50) return "var(--amber)";
  return "var(--deep-red)";
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  const subtitle =
    score > 69
      ? "Great Job!"
      : score > 49
        ? "Good Start"
        : "Needs Improvement";

  return (
    <div
      className="p-6"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "0.25rem",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6875rem",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "var(--muted)",
            }}
          >
            ATS Compatibility
          </p>
          <p
            className="mt-1"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              fontWeight: 700,
              color: getScoreColor(score),
            }}
          >
            {score}
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: 400,
                color: "var(--muted)",
                marginLeft: "4px",
              }}
            >
              / 100
            </span>
          </p>
        </div>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: getScoreColor(score),
          }}
        >
          {subtitle}
        </span>
      </div>

      {/* Score bar */}
      <div
        className="w-full h-1 mb-6"
        style={{
          backgroundColor: "var(--raised)",
          borderRadius: "1px",
        }}
      >
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${score}%`,
            backgroundColor: "var(--rust)",
            borderRadius: "1px",
          }}
        />
      </div>

      {/* Description */}
      <p
        className="mb-6"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.8125rem",
          color: "var(--muted)",
          lineHeight: 1.6,
        }}
      >
        This score represents how well your resume performs in Applicant
        Tracking Systems used by employers.
      </p>

      {/* Suggestions */}
      <div className="flex flex-col gap-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-start gap-3">
            {suggestion.type === "good" ? (
              <CheckCircle
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                style={{ color: "var(--sage)" }}
              />
            ) : (
              <AlertTriangle
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                style={{ color: "var(--amber)" }}
              />
            )}
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.8125rem",
                color:
                  suggestion.type === "good"
                    ? "var(--sage)"
                    : "var(--amber)",
                lineHeight: 1.5,
              }}
            >
              {suggestion.tip}
            </p>
          </div>
        ))}
      </div>

      {/* Encouragement */}
      <p
        className="mt-6 pt-4"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.875rem",
          fontWeight: 400,
          fontStyle: "italic",
          color: "var(--muted)",
          borderTop: "1px solid var(--border)",
        }}
      >
        Keep refining your resume to improve your chances of getting past ATS
        filters.
      </p>
    </div>
  );
};

export default ATS;