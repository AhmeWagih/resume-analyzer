import { usePuterStore } from "lib/puter";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
import { ArrowLeft } from "lucide-react";

export function meta({}) {
  return [
    { title: "Resume Analyzer — Analysis" },
    {
      name: "description",
      content: "Detailed AI-powered analysis of your resume.",
    },
  ];
}

const Resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated)
      navigate(`/auth?next=/resume/${id}`);
  }, [isLoading]);

  useEffect(() => {
    const loadResume = async () => {
      const resume = await kv.get(`resume:${id}`);

      if (!resume) return;
      const data = JSON.parse(resume);
      const resumeBlob = await fs.read(data.resumePath);
      if (!resumeBlob) return;

      const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
      const resumeUrl = URL.createObjectURL(pdfBlob);
      setResumeUrl(resumeUrl);
      const imageBlob = await fs.read(data.imagePath);
      if (!imageBlob) return;
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);
      setFeedback(data.feedback);
      setJobTitle(data.jobTitle);
      setCompanyName(data.companyName);
      console.log(data);
    };
    loadResume();
  }, [id]);

  return (
    <div style={{ backgroundColor: "var(--ink)", minHeight: "100vh" }}>
      {/* Top nav bar */}
      <nav
        className="flex items-center gap-4 px-6 lg:px-10 py-4"
        style={{
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link
          to="/dashboard"
          className="btn-ghost"
          style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <div className="flex items-center gap-2 overflow-hidden">
          {companyName && (
            <>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.875rem",
                  color: "var(--muted)",
                }}
                className="truncate"
              >
                {companyName}
              </span>
              <span style={{ color: "var(--muted)" }}>/</span>
            </>
          )}
          {jobTitle && (
            <>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.875rem",
                  color: "var(--muted)",
                }}
                className="truncate"
              >
                {jobTitle}
              </span>
              <span style={{ color: "var(--muted)" }}>/</span>
            </>
          )}
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--stone)",
            }}
          >
            Analysis
          </span>
        </div>
      </nav>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row w-full">
        {/* Left — PDF Preview */}
        <section
          className="w-full lg:w-1/2 lg:h-screen lg:sticky lg:top-0 overflow-y-auto p-6 lg:p-8"
          style={{
            backgroundColor: "var(--surface)",
            borderRight: "1px solid var(--border)",
          }}
        >
          {imageUrl && resumeUrl ? (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block fade-in"
            >
              <img
                src={imageUrl}
                className="w-full h-auto object-contain"
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "0.125rem",
                }}
                alt="Resume preview"
              />
            </a>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
              <div className="spinner" />
            </div>
          )}
        </section>

        {/* Right — Analysis */}
        <section className="w-full lg:w-1/2 p-6 lg:p-8 overflow-y-auto">
          {feedback ? (
            <div className="flex flex-col gap-10 fade-in">
              <Summary feedback={feedback} />
              <ATS
                score={feedback?.ATS?.score || 0}
                suggestions={feedback?.ATS?.tips || []}
              />
              <Details feedback={feedback} />
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="flex flex-col items-center gap-4">
                <div className="spinner" />
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.875rem",
                    color: "var(--muted)",
                  }}
                >
                  Loading analysis...
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Resume;
