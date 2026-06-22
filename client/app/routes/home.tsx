import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume Analyzer — Dashboard" },
    {
      name: "description",
      content:
        "View and manage your analyzed resumes with AI-powered feedback and ATS scores.",
    },
  ];
}

function getScoreClass(score: number): string {
  if (score >= 80) return "score-sage";
  if (score >= 50) return "score-amber";
  return "score-red";
}

export default function Dashboard() {
  const { auth, isLoading, kv, fs } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate("/auth?next=/dashboard");
  }, [auth.isAuthenticated, isLoading]);

  const loadResumes = async () => {
    setIsLoadingResumes(true);
    try {
      const resumeItems = (await kv.list("resume:*", true)) as KVItem[];
      const parsedResumes =
        resumeItems
          ?.filter((item) => item.value && item.value.trim() !== "")
          ?.map((item) => JSON.parse(item.value) as Resume) || [];
      // Sort by date (assuming id is uuid/timestamp based, or just reverse list)
      setResumes(parsedResumes.reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingResumes(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleDeleteResume = (resume: Resume) => {
    setResumeToDelete(resume);
  };

  const confirmDeleteResume = async () => {
    if (!resumeToDelete) return;
    const resume = resumeToDelete;
    try {
      setIsLoadingResumes(true);
      await kv.delete(`resume:${resume.id}`);
      try {
        await fs.delete(resume.imagePath);
      } catch (err) {}
      try {
        await fs.delete(resume.resumePath);
      } catch (err) {}
      await loadResumes();
    } catch (err) {
      console.error(err);
      alert("Failed to delete resume");
    } finally {
      setIsLoadingResumes(false);
      setResumeToDelete(null);
    }
  };

  const totalAnalyses = resumes.length;
  const avgScore =
    totalAnalyses > 0
      ? Math.round(
          resumes.reduce(
            (acc, curr) => acc + (curr.feedback?.overallScore || 0),
            0
          ) / totalAnalyses
        )
      : 0;

  // Find the job title with the highest score
  let topRole = "—";
  if (resumes.length > 0) {
    const highestScoreResume = [...resumes].sort(
      (a, b) => (b.feedback?.overallScore || 0) - (a.feedback?.overallScore || 0)
    )[0];
    topRole = highestScoreResume?.jobTitle || "—";
  }

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      <div className="film-grain"></div>
      
      {/* We use our existing Navbar but keep the page layout under it */}
      <Navbar />

      <main className="pt-24 pb-24 px-6 md:px-margin-desktop max-w-[1440px] mx-auto min-h-screen">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 border-b border-sep pb-8 gap-6">
          <div>
            <h1 className="font-display-md text-display-lg text-on-surface mb-2">
              Your Resumes
            </h1>
            <p className="font-subheading-italic text-on-surface-variant italic text-xl">
              Refine your professional narrative with cinematic precision.
            </p>
          </div>
          <Link
            to="/upload"
            className="bg-primary text-background font-ui-label px-8 py-4 flex items-center gap-2 hover:opacity-90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">upload</span>
            UPLOAD RESUME
          </Link>
        </header>

        {/* Dashboard Table */}
        <div className="w-full">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-gutter px-6 py-4 border-b border-sep items-center">
            <div className="col-span-5 font-ui-label text-caption text-on-surface-variant uppercase tracking-[0.2em]">
              File
            </div>
            <div className="col-span-2 font-ui-label text-caption text-on-surface-variant uppercase tracking-[0.2em]">
              Target Role
            </div>
            <div className="col-span-2 font-ui-label text-caption text-on-surface-variant uppercase tracking-[0.2em] text-center">
              ATS Score
            </div>
            <div className="col-span-3 font-ui-label text-caption text-on-surface-variant uppercase tracking-[0.2em] text-right">
              Actions
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-sep border-b border-sep">
            {isLoadingResumes ? (
              <div className="px-6 py-24 flex flex-col items-center justify-center text-center bg-background border-dashed border-2 border-sep mt-4">
                <div className="spinner mb-4 border-t-primary" />
                <p className="font-subheading-italic text-subheading-italic text-on-surface-variant italic">
                  Loading...
                </p>
              </div>
            ) : resumes.length === 0 ? (
              <div className="px-6 py-24 flex flex-col items-center justify-center text-center bg-background border-dashed border-2 border-sep mt-4">
                <span
                  className="material-symbols-outlined text-outline-variant mb-4"
                  style={{ fontSize: "48px" }}
                >
                  inbox
                </span>
                <p className="font-subheading-italic text-subheading-italic text-on-surface-variant italic">
                  Nothing here yet.
                </p>
                <p className="font-caption text-caption text-outline mt-2 max-w-xs">
                  Your analyzed resumes will appear in this archive as you curate
                  your professional legacy.
                </p>
              </div>
            ) : (
              resumes.map((resume, index) => (
                <div
                  key={resume.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-gutter px-4 sm:px-6 py-6 items-center transition-all duration-600 bg-card bg-hover group"
                  style={{ animation: `fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.1}s both` }}
                >
                  <div className="sm:col-span-5 flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary">
                      description
                    </span>
                    <span className="font-body-md font-semibold text-on-surface truncate max-w-[200px] sm:max-w-xs">
                      {resume.companyName || "Untitled"}
                    </span>
                  </div>
                  <div className="sm:col-span-2 font-body-md text-on-surface-variant truncate">
                    {resume.jobTitle || "—"}
                  </div>
                  <div className="sm:col-span-2 flex sm:justify-center">
                    <div
                      className={`w-10 h-10 flex items-center justify-center font-ui-label ${getScoreClass(
                        resume.feedback?.overallScore || 0
                      )}`}
                    >
                      {resume.feedback?.overallScore || 0}
                    </div>
                  </div>
                  <div className="sm:col-span-3 flex sm:justify-end gap-6 mt-2 sm:mt-0">
                    <Link
                      to={`/resume/${resume.id}`}
                      className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined">
                        visibility
                      </span>
                    </Link>
                    <button
                      onClick={() => handleDeleteResume(resume)}
                      className="text-on-surface-variant hover:text-error transition-colors flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dashboard Stats Bento */}
        <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="bg-card border border-sep p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-ui-label text-caption text-outline uppercase tracking-widest mb-4">
                Total Analyses
              </h3>
              <p className="font-display-md text-display-md text-on-surface">
                {totalAnalyses}
              </p>
            </div>
            <div className="mt-6 h-1 bg-outline-variant relative">
              <div
                className="absolute inset-0 bg-primary"
                style={{
                  width: `${Math.min((totalAnalyses / 20) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
          <div className="bg-card border border-sep p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-ui-label text-caption text-outline uppercase tracking-widest mb-4">
                Average Score
              </h3>
              <p className="font-display-md text-display-md text-secondary">
                {avgScore}
              </p>
            </div>
            <div className="mt-6 h-1 bg-outline-variant relative">
              <div
                className="absolute inset-0 bg-secondary"
                style={{ width: `${avgScore}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-card border border-sep p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-ui-label text-caption text-outline uppercase tracking-widest mb-4">
                Top Matching Role
              </h3>
              <p className="font-display-md text-[24px] leading-[1.3] font-bold text-tertiary truncate">
                {topRole}
              </p>
            </div>
            <div className="mt-6 h-1 bg-outline-variant relative">
              <div className="absolute inset-0 bg-tertiary w-1/2"></div>
            </div>
          </div>
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      {resumeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/90"
            onClick={() => setResumeToDelete(null)}
          ></div>
          <div className="relative bg-surface border border-sep p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="material-symbols-outlined text-error text-3xl">warning</span>
              <h2 className="font-display-md text-2xl text-on-surface">Delete Resume?</h2>
            </div>
            <p className="font-body-md text-on-surface-variant mb-8">
              Are you sure you want to delete <strong className="text-on-surface">"{resumeToDelete.companyName || resumeToDelete.jobTitle || "Untitled"}"</strong>? This action cannot be undone and will permanently remove the analysis.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setResumeToDelete(null)}
                className="font-ui-label px-6 py-3 uppercase transition-all border border-sep text-on-surface hover:bg-hover"
                disabled={isLoadingResumes}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteResume}
                className="font-ui-label px-6 py-3 uppercase transition-all bg-error text-white hover:opacity-90 flex items-center justify-center min-w-[120px]"
                disabled={isLoadingResumes}
              >
                {isLoadingResumes ? (
                  <div className="spinner border-t-white" style={{ width: 20, height: 20, borderWidth: "2px" }} />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
