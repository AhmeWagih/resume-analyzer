import { cn } from "lib/utils";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function getScoreColor(score: number): string {
  if (score >= 80) return "var(--sage)";
  if (score >= 50) return "var(--amber)";
  return "var(--deep-red)";
}

const CategorySection = ({
  title,
  score,
  tips,
}: {
  title: string;
  score: number;
  tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ borderTop: "1px solid var(--border)" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 cursor-pointer"
        style={{ background: "none", border: "none" }}
      >
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
          {title}
        </span>
        <div className="flex items-center gap-3">
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: getScoreColor(score),
            }}
          >
            {score}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
            style={{ color: "var(--muted)" }}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-6 flex flex-col gap-4">
              {tips.map((tip, index) => (
                <div key={index}>
                  <div className="flex items-start gap-2 mb-1">
                    <span
                      style={{
                        color:
                          tip.type === "good"
                            ? "var(--sage)"
                            : "var(--amber)",
                        fontSize: "0.5rem",
                        lineHeight: "1.75rem",
                      }}
                    >
                      ●
                    </span>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "var(--stone)",
                      }}
                    >
                      {tip.tip}
                    </p>
                  </div>
                  <p
                    className="ml-4"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.8125rem",
                      color: "var(--muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    {tip.explanation}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Details = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div>
      <p
        className="mb-4"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.6875rem",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          color: "var(--muted)",
        }}
      >
        Detailed Breakdown
      </p>

      <CategorySection
        title="Tone & Style"
        score={feedback.toneAndStyle.score}
        tips={feedback.toneAndStyle.tips}
      />
      <CategorySection
        title="Content"
        score={feedback.content.score}
        tips={feedback.content.tips}
      />
      <CategorySection
        title="Structure"
        score={feedback.structure.score}
        tips={feedback.structure.tips}
      />
      <CategorySection
        title="Skills"
        score={feedback.skills.score}
        tips={feedback.skills.tips}
      />
    </div>
  );
};

export default Details;
