import { useState, type FormEvent } from "react";
import FileUpload from "~/components/FileUpload";
import Navbar from "~/components/Navbar";
export function meta({}) {
  return [
    { title: "Resume Analyzer | Upload" },
    {
      name: "description",
      content:
        "Resume Analyzer is a tool that analyzes your resume and provides you with a score and feedback.",
    },
  ];
}
const Upload = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);
    const companyName = formData.get("company-name");
    const jobTitle = formData.get("job-title");
    const jobDescription = formData.get("job-description");
    console.log({ companyName, jobDescription, jobTitle, file });
  };
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading">
          <h1 className="max-w-3xl">Smart feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full" />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips.</h2>
          )}
          {!isProcessing ? (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  placeholder="e.g VOIS"
                  type="text"
                  name="company-name"
                  id="company-name"
                ></input>
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  placeholder="e.g Frontend Developer"
                  type="text"
                  name="job-title"
                  id="job-title"
                ></input>
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  placeholder="Write a clear & concise job description with responsibilities & expectations..."
                  name="job-description"
                  id="job-description"
                  rows={3}
                  className="resize-none"
                ></textarea>
              </div>
              <div className="form-div">
                <label htmlFor="upload">Upload Resume</label>
                <FileUpload onFileSelect={handleFileSelect} />
              </div>
              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          ) : (
            <></>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;
