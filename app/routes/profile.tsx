import { usePuterStore } from "lib/puter";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Navbar from "~/components/Navbar";

const Profile = () => {
  const { auth, isLoading, error, clearError, fs, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [deletingResume, setDeletingResume] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const loadResumes = async () => {
    try {
      setIsLoadingResumes(true);
      const resumeItems = (await kv.list("resume:*", true)) as KVItem[];
      const parsedResumes =
        resumeItems
          ?.filter((item) => item.value && item.value.trim() !== "") // Filter out empty values
          ?.map((item) => JSON.parse(item.value) as Resume) || [];
      setResumes(parsedResumes);
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
  }, [isLoading]);

  const handleDeleteResume = async (resume: Resume) => {
    const displayName = resume.companyName || resume.jobTitle || "Resume";
    if (!confirm(`Are you sure you want to delete "${displayName}"?`)) {
      return;
    }

    try {
      setDeletingResume(resume.id);
      setIsLoadingResumes(true);
      // Delete from KV storage
      await kv.delete(`resume:${resume.id}`);
      // Delete associated files
      try {
        await fs.delete(resume.imagePath);
      } catch (err) {
        console.warn("Failed to delete image file:", err);
      }
      try {
        await fs.delete(resume.resumePath);
      } catch (err) {
        console.warn("Failed to delete resume file:", err);
      }
      await loadResumes();
    } catch (err) {
      console.error("Error deleting resume:", err);
      alert("Failed to delete resume");
    } finally {
      setDeletingResume(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!showDeleteAllConfirm) {
      setShowDeleteAllConfirm(true);
      return;
    }

    try {
      setDeletingResume("all");
      setIsLoadingResumes(true);
      for (const resume of resumes) {
        // Delete from KV storage
        await kv.delete(`resume:${resume.id}`);
        // Delete associated files
        try {
          await fs.delete(resume.imagePath);
        } catch (err) {
          console.warn("Failed to delete image file:", err);
        }
        try {
          await fs.delete(resume.resumePath);
        } catch (err) {
          console.warn("Failed to delete resume file:", err);
        }
      }
      await loadResumes();
      setShowDeleteAllConfirm(false);
    } catch (err) {
      console.error("Error deleting resumes:", err);
      alert("Failed to delete some resumes");
    } finally {
      setDeletingResume(null);
    }
  };

  if (isLoading) {
    return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="resume-loader">
            <div className="resume-doc resume-doc-1">
              <div className="doc-line"></div>
              <div className="doc-line"></div>
              <div className="doc-line short"></div>
            </div>
            <div className="resume-doc resume-doc-2">
              <div className="doc-line"></div>
              <div className="doc-line"></div>
              <div className="doc-line short"></div>
            </div>
            <div className="resume-doc resume-doc-3">
              <div className="doc-line"></div>
              <div className="doc-line"></div>
              <div className="doc-line short"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
        <Navbar />
        <div className="main-section">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-2xl">
            <h2 className="text-red-600">Error</h2>
            <p className="text-red-500 mt-2">{error}</p>
            <button onClick={clearError} className="mt-4 primary-button w-fit">
              Dismiss
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />
      <section className="main-section">
        <div className="page-heading">
          <h1>My Resumes</h1>
          <h2>View and manage your resume applications</h2>
        </div>

        {isLoadingResumes ? (
          <div className="flex flex-col items-center justify-center gap-8">
            <div className="resume-loader">
              <div className="resume-doc resume-doc-1">
                <div className="doc-line"></div>
                <div className="doc-line"></div>
                <div className="doc-line short"></div>
              </div>
              <div className="resume-doc resume-doc-2">
                <div className="doc-line"></div>
                <div className="doc-line"></div>
                <div className="doc-line short"></div>
              </div>
              <div className="resume-doc resume-doc-3">
                <div className="doc-line"></div>
                <div className="doc-line"></div>
                <div className="doc-line short"></div>
              </div>
            </div>
            <h2 className="text-center animate-pulse">Loading resumes...</h2>
          </div>
        ) : resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 bg-white rounded-2xl p-8 max-w-md">
            <img
              src="/icons/info.svg"
              alt="Info"
              className="w-16 h-16 opacity-50"
            />
            <h2 className="text-center">No resumes found</h2>
            <p className="text-dark-200 text-center">
              Upload your first resume to get started.
            </p>
            <Link to="/upload" className="primary-button w-fit mt-4">
              Upload Resume
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-6 w-full max-w-6xl">
              <div className="flex flex-row justify-between items-center bg-white rounded-2xl p-4">
                <div>
                  <p className="text-lg font-semibold">
                    {resumes.length}{" "}
                    {resumes.length === 1 ? "resume" : "resumes"} found
                  </p>
                  <p className="text-sm text-dark-200">
                    Authenticated as: {auth.user?.username}
                  </p>
                </div>
                {resumes.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    disabled={deletingResume === "all"}
                    className={`px-6 py-3 rounded-full font-semibold transition-all ${
                      showDeleteAllConfirm
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-red-100 hover:bg-red-200 text-red-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {deletingResume === "all"
                      ? "Deleting..."
                      : showDeleteAllConfirm
                        ? "Confirm Delete All"
                        : "Delete All Resumes"}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative">
                {isLoadingResumes && deletingResume && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-2xl">
                    <div className="flex flex-col items-center gap-4">
                      <svg
                        className="animate-spin h-8 w-8 text-gray-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <p className="text-gray-600 font-semibold">
                        {deletingResume === "all"
                          ? "Deleting all resumes..."
                          : "Deleting resume..."}
                      </p>
                    </div>
                  </div>
                )}
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col gap-4 ${
                      isLoadingResumes && deletingResume ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex flex-row justify-between items-start">
                      <div className="flex-1 min-w-0">
                        {resume.companyName && (
                          <h3
                            className="font-semibold text-lg truncate"
                            title={resume.companyName}
                          >
                            {resume.companyName}
                          </h3>
                        )}
                        {resume.jobTitle && (
                          <p
                            className="text-dark-200 text-sm mt-1 truncate"
                            title={resume.jobTitle}
                          >
                            {resume.jobTitle}
                          </p>
                        )}
                        {!resume.companyName && !resume.jobTitle && (
                          <h3 className="font-semibold text-lg">Resume</h3>
                        )}
                        <div className="flex flex-col gap-1 mt-2 text-sm text-dark-200">
                          <p className="text-xs">
                            Score: {resume.feedback.overallScore}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row gap-2 mt-auto">
                      <Link
                        to={`/resume/${resume.id}`}
                        className="px-4 py-2 flex items-center gap-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View</span>
                      </Link>

                      <button
                        onClick={() => handleDeleteResume(resume)}
                        disabled={deletingResume === resume.id || isLoadingResumes}
                        className={`px-4 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${
                          deletingResume === resume.id || isLoadingResumes
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-red-100 hover:bg-red-200 text-red-700"
                        }`}
                      >
                        {deletingResume === resume.id || isLoadingResumes ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Deleting...</span>
                          </>
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default Profile;
