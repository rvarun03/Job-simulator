"use client";

import { use, useState } from "react";
import {api} from "../../lib/api";

type CoverLetterResult = {
  subject?: string;
  cover_letter?: string;
};

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ THIS is the fix
  const { id } = use(params);
  const resumeId = Number(id);

  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [result, setResult] = useState<CoverLetterResult | null>(null);

  // useEffect(() => {
  //   if (Number.isNaN(resumeId)) return;

  //   const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE_URL;

  //   const ws = new WebSocket(`${WS_BASE}/ws/${resumeId}`);

  //   ws.onmessage = (event) => {
  //     const data = JSON.parse(event.data);

  //     setStep(data.step);

  //     if (data.step === "completed") {
  //       setResult(data.result);
  //       setLoading(false);
  //     }
  //   };

  //   ws.onerror = () => setLoading(false);

  //   wsRef.current = ws;

  //   return () => ws.close();
  // }, [resumeId]);

  const generateCoverLetter = async () => {
  try {
    setLoading(true);
    setResult(null);
    setStep("");

    const res = await api.generateCoverLetter(
      resumeId,
      jobDescription
    );

    // // 🔥 DEBUG ALERT
    // alert(JSON.stringify(res, null, 2));

    // console.log("BACKEND RESPONSE:", res);

    // ✅ STORE RESULT IN STATE
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

      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste Job Description"
        className="w-full min-h-[220px] border rounded-xl p-4"
      />

      <button
        onClick={generateCoverLetter}
        disabled={loading}
        className="bg-black text-white px-5 py-3 rounded-xl disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Cover Letter"}
      </button>

      {loading && (
        <div className="border rounded-xl p-4 bg-gray-50">
          <p className="font-medium">Current Step:</p>
          <p>{step || "Starting..."}</p>
        </div>
      )}

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
