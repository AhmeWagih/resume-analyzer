import { usePuterStore } from "lib/puter";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Navbar from "~/components/Navbar";

function getScoreClass(score: number): string {
  if (score >= 80) return "score-sage";
  if (score >= 50) return "score-amber";
  return "score-red";
}

const Profile = () => {
  const { auth, isLoading, error, clearError, fs, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [deletingResume, setDeletingResume] = useState<string | null>(null);
  const [resumeToDelete, setResumeToDelete] = useState<Resume | "all" | null>(null);

  const loadResumes = async () => {
    try {
      setIsLoadingResumes(true);
      const resumeItems = (await kv.list("resume:*", true)) as KVItem[];
      const parsedResumes =
        resumeItems
          ?.filter((item) => item.value && item.value.trim() !== "")
          ?.map((item) => JSON.parse(item.value) as Resume) || [];
      // Sort by date/latest
      setResumes(parsedResumes.reverse());
    } catch (err) {
      console.error("Error loading resumes:", err);
    } finally {
      setIsLoadingResumes(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/profile");
    }
  }, [auth.isAuthenticated, isLoading]);

  const handleDeleteResume = (resume: Resume) => {
    setResumeToDelete(resume);
  };

  const handleDeleteAll = () => {
    setResumeToDelete("all");
  };

  const confirmDelete = async () => {
    if (!resumeToDelete) return;
    try {
      setIsLoadingResumes(true);
      if (resumeToDelete === "all") {
        setDeletingResume("all");
        for (const resume of resumes) {
          await kv.delete(`resume:${resume.id}`);
          try { await fs.delete(resume.imagePath); } catch (err) {}
          try { await fs.delete(resume.resumePath); } catch (err) {}
        }
      } else {
        setDeletingResume(resumeToDelete.id);
        await kv.delete(`resume:${resumeToDelete.id}`);
        try { await fs.delete(resumeToDelete.imagePath); } catch (err) {}
        try { await fs.delete(resumeToDelete.resumePath); } catch (err) {}
      }
      await loadResumes();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    } finally {
      setIsLoadingResumes(false);
      setDeletingResume(null);
      setResumeToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background text-on-surface min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="spinner border-t-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background text-on-surface min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] px-6">
          <div className="max-w-md p-6 bg-surface border border-error rounded flex flex-col gap-4">
            <p className="font-body-md text-error">{error}</p>
            <button
              onClick={clearError}
              className="bg-primary text-background font-ui-label px-6 py-3 uppercase hover:opacity-90 transition-all active:scale-95"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      <div className="film-grain"></div>
      <Navbar />

      <main className="pt-24 pb-24 px-6 md:px-margin-desktop max-w-[1440px] mx-auto min-h-screen">
        {/* Header Section */}
        <header className="mb-16 border-b border-sep pb-8">
          <h1 className="font-display-md text-display-lg text-on-surface mb-2">
            Profile
          </h1>
          {auth.user?.username && (
            <p className="font-subheading-italic text-on-surface-variant italic text-xl">
              {auth.user.username}
            </p>
          )}
        </header>

        {/* Dashboard Table wrapper */}
        <div className="w-full">
          {/* Table Header with Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-sep">
            <div className="font-ui-label text-caption text-on-surface-variant uppercase tracking-[0.2em]">
              Your Resumes ({resumes.length})
            </div>
            {resumes.length > 0 && (
              <button
                onClick={handleDeleteAll}
                disabled={deletingResume === "all"}
                className={`font-ui-label px-6 py-2 uppercase transition-all border border-error text-error hover:bg-error/10`}
              >
                {deletingResume === "all" ? "Deleting..." : "Delete All"}
              </button>
            )}
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
                  folder_open
                </span>
                <p className="font-subheading-italic text-subheading-italic text-on-surface-variant italic">
                  No resumes found.
                </p>
                <Link
                  to="/upload"
                  className="mt-6 bg-primary text-background font-ui-label px-8 py-3 flex items-center gap-2 hover:opacity-90 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined">upload</span>
                  UPLOAD RESUME
                </Link>
              </div>
            ) : (
              resumes.map((resume, index) => (
                <div
                  key={resume.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-gutter px-4 sm:px-6 py-6 items-center transition-all duration-600 bg-card bg-hover group"
                  style={{
                    animation: `fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) \${index * 0.1}s both`,
                    opacity: isLoadingResumes && deletingResume ? 0.5 : 1,
                  }}
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
                      className={`w-10 h-10 flex items-center justify-center font-ui-label \${getScoreClass(
                        resume.feedback?.overallScore || 0
                      )}`}
                    >
                      {resume.feedback?.overallScore || 0}
                    </div>
                  </div>
                  <div className="sm:col-span-3 flex sm:justify-end gap-6 mt-2 sm:mt-0">
                    <Link
                      to={`/resume/\${resume.id}`}
                      className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined">
                        visibility
                      </span>
                    </Link>
                    <button
                      onClick={() => handleDeleteResume(resume)}
                      disabled={
                        deletingResume === resume.id || isLoadingResumes
                      }
                      className="text-on-surface-variant hover:text-error transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      {deletingResume === resume.id ? (
                        <div
                          className="spinner border-t-error"
                          style={{ width: 20, height: 20, borderWidth: "2px" }}
                        />
                      ) : (
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Delete account */}
        <div className="mt-24 pt-8 border-t border-sep">
          <button className="font-ui-label px-8 py-3 uppercase transition-all border border-error text-error hover:bg-error/10">
            Delete Account
          </button>
        </div>
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
              <h2 className="font-display-md text-2xl text-on-surface">
                {resumeToDelete === "all" ? "Delete All Resumes?" : "Delete Resume?"}
              </h2>
            </div>
            <p className="font-body-md text-on-surface-variant mb-8">
              {resumeToDelete === "all" ? (
                "Are you sure you want to permanently delete all of your analyzed resumes? This action cannot be undone."
              ) : (
                <>Are you sure you want to delete <strong className="text-on-surface">"{(resumeToDelete as Resume).companyName || (resumeToDelete as Resume).jobTitle || "Untitled"}"</strong>? This action cannot be undone and will permanently remove the analysis.</>
              )}
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
                onClick={confirmDelete}
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
};

export default Profile;
