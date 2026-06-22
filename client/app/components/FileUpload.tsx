import { formatSize } from "lib/utils";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CheckCircle, Upload, X } from "lucide-react";

interface FileUploadProps {
  onFileSelect?: (file: File | null) => void;
}

const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;
      onFileSelect?.(file);
    },
    [onFileSelect]
  );

  const maxFileSize = 20 * 1024 * 1024;
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      multiple: false,
      accept: { "application/pdf": [".pdf"] },
      maxSize: maxFileSize,
    });

  const file = acceptedFiles[0] || null;

  return (
    <div className="w-full">
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {file ? (
          <div
            className="flex items-center justify-between p-4"
            style={{
              backgroundColor: "var(--raised)",
              border: "1px solid var(--border)",
              borderRadius: "0.25rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <CheckCircle
                className="w-5 h-5 flex-shrink-0"
                style={{ color: "var(--rust)" }}
              />
              <div>
                <p
                  className="truncate max-w-xs"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "var(--stone)",
                  }}
                >
                  {file.name}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.75rem",
                    color: "var(--muted)",
                  }}
                >
                  {formatSize(file.size)}
                </p>
              </div>
            </div>
            <button
              className="flex-shrink-0 cursor-pointer"
              style={{
                background: "none",
                border: "none",
                color: "var(--muted)",
                padding: "4px",
              }}
              onClick={() => onFileSelect?.(null)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center p-10 cursor-pointer transition-colors"
            style={{
              backgroundColor: "var(--raised)",
              border: "2px dashed var(--border)",
              borderRadius: "0.25rem",
              borderColor: isDragActive
                ? "var(--rust)"
                : "var(--border)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--rust)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = isDragActive
                ? "var(--rust)"
                : "var(--border)")
            }
          >
            <Upload
              className="w-8 h-8 mb-3"
              style={{ color: "var(--muted)" }}
            />
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                color: "var(--muted)",
              }}
            >
              Drop your resume here
            </p>
            <p
              className="mt-1"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                color: "var(--muted)",
              }}
            >
              PDF only (max {formatSize(maxFileSize)})
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
