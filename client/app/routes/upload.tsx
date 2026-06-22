import { prepareInstructions, AIResponseFormat } from "../../constants";
import { convertPdfToImage } from "lib/pdfToImage";
import { usePuterStore } from "lib/puter";
import { generateUUID } from "lib/utils";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import FileUpload from "~/components/FileUpload";
import Navbar from "~/components/Navbar";

export function meta({}) {
  return [
    { title: "Resume Analyzer — Upload" },
    {
      name: "description",
      content:
        "Upload your resume PDF and get AI-powered ATS scoring with detailed feedback.",
    },
  ];
}

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);
    setStatusText("Uploading the file...");

    const uploadedFile = await fs.upload([file]);
    if (!uploadedFile) return setStatusText("Error: Failed to upload the file");
    setStatusText("Converting to image...");

    const imageFile = await convertPdfToImage(file);
    if (!imageFile.file) {
      return setStatusText("Error: Failed to convert pdf to image");
    }
    setStatusText("Uploading the image...");

    const uploadedImage = await fs.upload([imageFile.file]);
    if (!uploadedImage)
      return setStatusText("Error: Failed to upload the image");
    setStatusText("Preparing data...");

    const uuid = generateUUID();
    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback: "",
    };
    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText("Analyzing...");
    const feedback = await ai.feedback(
      uploadedFile.path,
      prepareInstructions({ jobTitle, jobDescription, AIResponseFormat })
    );
    if (!feedback) return setStatusText("Error: Failed to analyze resume");
    const feedbackText =
      typeof feedback.message.content == "string"
        ? feedback.message.content
        : feedback.message.content[0].text;

    data.feedback = JSON.parse(feedbackText);
    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText("Analysis complete, redirecting...");
    console.log(data);
    navigate(`/resume/${uuid}`);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);
    
    if (!file) return;

    let companyName = formData.get("company-name") as string;
    let jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;
    
    if (!jobDescription || jobDescription.trim() === "") {
      alert("Please provide a Job Description so the AI has something to evaluate your resume against.");
      return;
    }

    // Fallbacks if the user left them empty
    if (!companyName || companyName.trim() === "") {
      companyName = file.name.replace(/\.[^/.]+$/, ""); // Use filename without extension
    }
    if (!jobTitle || jobTitle.trim() === "") {
      jobTitle = "General Resume";
    }

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  return (
    <div style={{ backgroundColor: "var(--ink)", minHeight: "100vh" }}>
      <Navbar />

      <section className="max-w-2xl mx-auto px-6 lg:px-10 py-12">
        <h1
          className="mb-2"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.25rem",
            fontWeight: 700,
            color: "var(--stone)",
          }}
        >
          Upload Resume
        </h1>
        <p
          className="mb-10"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9375rem",
            color: "var(--muted)",
          }}
        >
          {isProcessing
            ? statusText
            : "Drop your resume for an ATS score and improvement tips."}
        </p>

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="spinner" style={{ width: 40, height: 40 }} />
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1rem",
                fontWeight: 500,
                color: "var(--stone)",
              }}
            >
              {statusText}
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.8125rem",
                color: "var(--muted)",
              }}
            >
              This usually takes under 30 seconds.
            </p>
          </div>
        ) : (
          <form id="upload-form" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="company-name">Company Name</label>
              <input
                placeholder="e.g. Google"
                type="text"
                name="company-name"
                id="company-name"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="job-title">Job Title</label>
              <input
                placeholder="e.g. Frontend Developer"
                type="text"
                name="job-title"
                id="job-title"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="job-description">Job Description</label>
              <textarea
                required
                placeholder="Paste the job description here..."
                name="job-description"
                id="job-description"
                rows={6}
                style={{ resize: "none" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label>Resume File</label>
              <FileUpload onFileSelect={handleFileSelect} />
            </div>

            <button className="btn-primary w-full" type="submit">
              Analyze Resume
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

export default Upload;
