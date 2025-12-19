// cspell:ignore puter
import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume Analyzer" },
    {
      name: "description",
      content:
        "Resume Analyzer is a tool that analyzes your resume and provides you with a score and feedback.",
    },
  ];
}

export default function Home() {
  const { auth, isLoading, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated, isLoading]);

  useEffect(() => {
    const loadResumes = async () => {
      setIsLoadingResumes(true);

      const resumes = (await kv.list("resume:*", true)) as KVItem[];

      const parsedResumes = resumes?.map(
        (resume) => JSON.parse(resume.value) as Resume
      );

      setResumes(parsedResumes || []);
      setIsLoadingResumes(false);
    };

    loadResumes();
  }, []);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Application & Resume Rating</h1>
          {!isLoadingResumes && resumes?.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
        <Link to="/upload">
          <p className="primary-button w-fit">Upload Resume</p>
        </Link>
        </div>
        {/* {isLoadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" />
          </div>
        )} */}

        {isLoadingResumes && (
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
            <h2 className="text-center animate-pulse">
              Fetching your resumes...
            </h2>
          </div>
        )}

        {!isLoadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
