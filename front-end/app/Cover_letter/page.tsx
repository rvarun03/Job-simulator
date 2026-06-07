"use client";
import { useState } from "react";
import {api} from "../lib/api";

type CoverLetterResult = {
  subject?: string;
  cover_letter?: string;
};

export default function Page() {
  const [resumeId, setResumeId] = useState<number | "">("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CoverLetterResult | null>(null);

  const generateCoverLetter = async () => {
    try {
      setLoading(true);
      setResult(null);

      const res = await api.generateCoverLetter(
        resumeId ? Number(resumeId) : undefined,
        jobDescription
      );

      console.log("API RESPONSE:", res);

      setResult(res);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const copyCoverLetter = async () => {
    if (!result?.cover_letter) return;

    await navigator.clipboard.writeText(result.cover_letter);
    alert("Copied!");
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">

      <h1 className="text-3xl font-bold">
        AI Cover Letter Generator
      </h1>

      {/* RESUME ID INPUT */}
      <input
        type="number"
        value={resumeId}
        onChange={(e) =>
          setResumeId(e.target.value ? Number(e.target.value) : "")
        }
      placeholder="Resume ID (optional, latest if empty)"
        className="w-full border rounded-xl p-3"
      />

      {/* JOB DESCRIPTION */}
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste Job Description"
        className="w-full min-h-[220px] border rounded-xl p-4"
      />

      {/* BUTTON */}
      <button
        onClick={generateCoverLetter}
        disabled={loading}
        className="bg-black text-white px-5 py-3 rounded-xl disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Cover Letter"}
      </button>

      {/* RESULT */}
      {result && (
        <div className="border rounded-2xl p-6 space-y-6">

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              Generated Cover Letter
            </h2>

            <button
              onClick={copyCoverLetter}
              className="border px-4 py-2 rounded-lg"
            >
              Copy
            </button>
          </div>

          <div>
            <p className="font-semibold">Subject</p>
            <div className="border rounded-xl p-3 mt-2">
              {result.subject}
            </div>
          </div>

          <div>
            <p className="font-semibold">Cover Letter</p>
            <div className="border rounded-xl p-5 whitespace-pre-wrap">
              {result.cover_letter}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
