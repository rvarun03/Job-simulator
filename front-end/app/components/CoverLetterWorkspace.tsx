"use client";

import { FormEvent, useState } from "react";
import { api } from "../lib/api";

type CoverLetterResult = {
  subject?: string;
  cover_letter?: string;
  key_strengths_used?: string[];
  keywords_included?: string[];
};

type Props = {
  initialResumeId?: number;
  lockResumeId?: boolean;
};

const SparkIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="m12 2 1.5 5.1L19 8.5l-5.5 1.4L12 15l-1.5-5.1L5 8.5l5.5-1.4L12 2Zm7 12 .8 2.7 2.7.8-2.7.8L19 21l-.8-2.7-2.7-.8 2.7-.8L19 14Z" />
  </svg>
);

export default function CoverLetterWorkspace({ initialResumeId, lockResumeId = false }: Props) {
  const [resumeId, setResumeId] = useState<number | "">(
    initialResumeId && !Number.isNaN(initialResumeId) ? initialResumeId : ""
  );
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<CoverLetterResult | null>(null);

  const wordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;

  const generate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!jobDescription.trim()) {
      setError("Paste a job description before generating your letter.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setCopied(false);
      setResult(null);
      const response = await api.generateCoverLetter(
        resumeId ? Number(resumeId) : undefined,
        jobDescription.trim()
      );
      setResult(response as CoverLetterResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The cover letter could not be generated.");
    } finally {
      setLoading(false);
    }
  };

  const copyLetter = async () => {
    if (!result?.cover_letter) return;
    await navigator.clipboard.writeText(
      result.subject ? `${result.subject}\n\n${result.cover_letter}` : result.cover_letter
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const evidence = [...(result?.key_strengths_used ?? []), ...(result?.keywords_included ?? [])]
    .filter((item, index, items) => items.indexOf(item) === index)
    .slice(0, 8);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 px-6 py-8 shadow-2xl shadow-black/25 sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.14),transparent_68%)]" />
          <div className="relative max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
              <SparkIcon /> Grounded writing assistant
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Build a cover letter from real resume evidence.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
              Add the role description and let the platform retrieve relevant resume details for a concise, tailored application.
            </p>
          </div>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <section className="rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-7 lg:sticky lg:top-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">Application details</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Tell us about the role</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">Step 1 of 1</span>
            </div>

            <form onSubmit={generate} className="mt-7 space-y-6">
              <label className="block">
                <span className="flex justify-between text-sm font-medium text-zinc-200">
                  Resume ID {!lockResumeId && <span className="text-xs font-normal text-zinc-500">Optional</span>}
                </span>
                {lockResumeId ? (
                  <div className="mt-2 flex h-12 items-center justify-between rounded-xl border border-white/10 bg-zinc-950 px-4">
                    <span className="font-medium text-white">Resume #{resumeId}</span>
                    <span className="text-xs text-emerald-300">Selected</span>
                  </div>
                ) : (
                  <input
                    type="number"
                    min="1"
                    value={resumeId}
                    onChange={(event) => setResumeId(event.target.value ? Number(event.target.value) : "")}
                    placeholder="Uses your latest resume when empty"
                    className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-300/60 focus:ring-4 focus:ring-amber-300/10"
                  />
                )}
                <span className="mt-2 block text-xs leading-5 text-zinc-500">Use the ID returned after upload for the most predictable result.</span>
              </label>

              <label className="block">
                <span className="flex justify-between text-sm font-medium text-zinc-200">
                  Job description <span className="text-xs font-normal text-zinc-500">{wordCount} words</span>
                </span>
                <textarea
                  value={jobDescription}
                  onChange={(event) => { setJobDescription(event.target.value); setError(""); }}
                  placeholder="Paste the job title, responsibilities, required skills, and preferred qualifications..."
                  className="mt-2 min-h-72 w-full resize-y rounded-xl border border-white/10 bg-zinc-950 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-300/60 focus:ring-4 focus:ring-amber-300/10"
                />
              </label>

              {error && <div role="alert" className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}

              <button
                type="submit"
                disabled={loading || !jobDescription.trim()}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 text-sm font-bold text-zinc-950 transition hover:bg-amber-200 focus:ring-4 focus:ring-amber-300/20 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white" /> Retrieving evidence and writing...</> : <><SparkIcon /> Generate tailored letter</>}
              </button>
              <p className="text-center text-xs leading-5 text-zinc-500">Review generated content before submitting your application.</p>
            </form>
          </section>

          <section aria-live="polite" className="min-h-[42rem] rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-xl shadow-black/20 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4 px-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Preview</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Your cover letter</h2>
              </div>
              {result?.cover_letter && (
                <button type="button" onClick={copyLetter} className="h-10 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.08]">
                  {copied ? "Copied" : "Copy letter"}
                </button>
              )}
            </div>

            {loading ? (
              <EmptyPreview title="Creating your draft" text="Retrieving relevant experience and matching it carefully to the role." active />
            ) : result ? (
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 shadow-2xl shadow-black/30">
                <div className="border-b border-zinc-200 bg-white px-6 py-5 sm:px-9">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">Subject</p>
                  <p className="mt-2 font-semibold">{result.subject || "Application cover letter"}</p>
                </div>
                <article className="min-h-[31rem] whitespace-pre-wrap px-6 py-8 text-[15px] leading-7 text-zinc-700 sm:px-9 sm:py-10">
                  {result.cover_letter || "No letter content was returned."}
                </article>
                {evidence.length > 0 && (
                  <div className="border-t border-zinc-200 bg-white px-6 py-5 sm:px-9">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">Evidence used</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {evidence.map((item) => <span key={item} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">{item}</span>)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyPreview title="Your draft will appear here" text="Paste the full job description for a more specific, evidence-based result." />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function EmptyPreview({ title, text, active = false }: { title: string; text: string; active?: boolean }) {
  return (
    <div className="flex min-h-[34rem] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-zinc-950/50 px-6 text-center">
      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${active ? "border-amber-300/20 bg-amber-300/10 text-amber-200" : "border-white/10 bg-white/[0.04] text-zinc-500"}`}>
        {active ? <SparkIcon /> : <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>}
      </div>
      <h3 className="mt-6 text-lg font-semibold text-zinc-200">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">{text}</p>
    </div>
  );
}
