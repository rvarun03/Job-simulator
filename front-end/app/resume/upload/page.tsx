"use client";

import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { api } from "../../lib/api";

type UploadResult = {
  id?: number;
  raw_text?: string;
  structured_data?: unknown;
};

export default function ResumeUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
    setError("");
    setResult(null);
  };

  const uploadResume = async () => {
    if (!file) {
      setError("Choose a PDF or DOCX resume first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await api.uploadResume(file);
      setResult(response);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to upload resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <section className="rounded-lg border border-white/10 bg-zinc-900 p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-white">
              Upload Resume
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-zinc-400">
              Upload a PDF or DOCX resume to create a saved resume ID for the job tools.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-zinc-200">
                Resume file
              </span>
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="mt-2 block w-full rounded-md border border-white/15 bg-zinc-950 p-3 text-sm text-zinc-100 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-500"
              />
            </label>

            {file && (
              <div className="rounded-md border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-300">
                Selected: <span className="font-semibold text-white">{file.name}</span>
              </div>
            )}

            {error && (
              <div className="rounded-md border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              onClick={uploadResume}
              disabled={loading}
              className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Upload Resume"}
            </button>
          </div>
        </section>

        {result && (
          <section className="rounded-lg border border-white/10 bg-zinc-900 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-white">
              Resume Uploaded
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-zinc-500">Resume ID</p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {result.id ?? "Created"}
                </p>
              </div>

              <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-zinc-500">Next step</p>
                <Link
                  href="/Job_match"
                  className="mt-2 inline-flex text-sm font-semibold text-blue-300 hover:text-blue-200"
                >
                  Analyze a job match
                </Link>
              </div>
            </div>

            {result.raw_text && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-zinc-200">
                  Extracted text preview
                </p>
                <div className="mt-2 max-h-64 overflow-auto rounded-md border border-white/10 bg-zinc-950 p-4 text-sm leading-6 text-zinc-300">
                  {result.raw_text}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
