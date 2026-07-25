"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import { api, type CandidateRankResponse } from "../lib/api";

const clampScore = (score: number) => Math.min(100, Math.max(0, Number(score) || 0));

const formatScore = (score: number) => {
  const safeScore = Number(score) || 0;
  return Number.isInteger(safeScore) ? String(safeScore) : safeScore.toFixed(1);
};

export default function CandidateRankingPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumes, setResumes] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<CandidateRankResponse[]>([]);

  const rankedCandidates = useMemo(
    () => [...results].sort((a, b) => a.rank - b.rank),
    [results]
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setResumes(Array.from(event.target.files ?? []));
    setError("");
    setResults([]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!jobDescription.trim()) {
      setError("Paste a job description before ranking candidates.");
      return;
    }

    if (resumes.length === 0) {
      setError("Upload at least one candidate resume.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResults([]);

      const data = await api.rankCandidates(
        jobDescription.trim(),
        resumes
      );

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rank candidates");
    } finally {
      setLoading(false);
    }
  };

  const renderTags = (
    items: string[],
    emptyText: string,
    className: string
  ) => {
    if (items.length === 0) {
      return (
        <p className="text-sm text-zinc-500">
          {emptyText}
        </p>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full border px-3 py-1 text-sm font-medium ${className}`}
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  const renderList = (
    title: string,
    items: string[],
    emptyText: string,
    borderColor: string
  ) => (
    <div className={`rounded-md border ${borderColor} bg-white/[0.03] p-4`}>
      <h3 className="text-sm font-semibold text-white">
        {title}
      </h3>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li
              key={item}
              className="rounded-md border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm leading-6 text-zinc-300"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">
          {emptyText}
        </p>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-2xl shadow-black/30">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-between gap-10 border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="space-y-5">
                <div className="inline-flex w-fit items-center rounded-md border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-semibold uppercase text-violet-200">
                  HR Ranking
                </div>

                <div className="space-y-3">
                  <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                    Candidate Ranking
                  </h1>
                  <p className="max-w-lg text-sm leading-7 text-zinc-400 sm:text-base">
                    Rank multiple resumes against one job description using the HR candidate scoring endpoint.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs text-zinc-500">Files</p>
                  <p className="mt-1 font-semibold text-zinc-100">
                    {resumes.length || 0}
                  </p>
                </div>
                <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs text-zinc-500">Method</p>
                  <p className="mt-1 font-semibold text-zinc-100">
                    AI + TF-IDF
                  </p>
                </div>
                <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs text-zinc-500">Route</p>
                  <p className="mt-1 font-semibold text-zinc-100">
                    /hr
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 bg-zinc-950/70 p-6 sm:p-8"
            >
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-zinc-300">
                  Job Description
                </span>
                <textarea
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Paste the role requirements here"
                  className="min-h-56 resize-y rounded-md border border-white/10 bg-zinc-900 px-4 py-3 text-base leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-300 focus:ring-4 focus:ring-violet-300/10"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-zinc-300">
                  Candidate Resumes
                </span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="block w-full rounded-md border border-white/15 bg-zinc-900 p-3 text-sm text-zinc-100 file:mr-4 file:rounded-md file:border-0 file:bg-violet-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-violet-400"
                />
              </label>

              {resumes.length > 0 && (
                <div className="max-h-36 overflow-auto rounded-md border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-zinc-200">
                    Selected files
                  </p>
                  <div className="mt-3 space-y-2">
                    {resumes.map((resume) => (
                      <p
                        key={`${resume.name}-${resume.size}`}
                        className="truncate text-sm text-zinc-400"
                      >
                        {resume.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-md border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 items-center justify-center rounded-md bg-violet-400 px-5 text-sm font-bold text-zinc-950 transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                {loading ? "Ranking Candidates..." : "Rank Candidates"}
              </button>
            </form>
          </div>
        </section>

        {rankedCandidates.length > 0 && (
          <section className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Ranked Candidates
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Results returned from the candidate ranking endpoint.
              </p>
            </div>

            <div className="space-y-5">
              {rankedCandidates.map((candidate) => {
                const finalScore = clampScore(candidate.final_score);

                return (
                  <article
                    key={`${candidate.rank}-${candidate.resume_filename}`}
                    className="rounded-lg border border-white/10 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6"
                  >
                    <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
                      <div className="space-y-5">
                        <div>
                          <p className="text-sm font-semibold uppercase text-violet-200">
                            Rank #{candidate.rank}
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold text-white">
                            {candidate.candidate_name}
                          </h3>
                          <p className="mt-1 truncate text-sm text-zinc-500">
                            {candidate.resume_filename}
                          </p>
                        </div>

                        <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                          <p className="text-sm text-zinc-500">Final Score</p>
                          <div className="mt-3 flex items-end gap-2">
                            <p className="text-5xl font-semibold tracking-tight text-white">
                              {formatScore(candidate.final_score)}
                            </p>
                            <span className="pb-2 text-xl font-semibold text-violet-200">
                              %
                            </span>
                          </div>
                          <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-violet-300"
                              style={{ width: `${finalScore}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-zinc-500">AI</p>
                            <p className="mt-1 text-lg font-semibold text-white">
                              {formatScore(candidate.ai_score)}
                            </p>
                          </div>
                          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-zinc-500">TF-IDF</p>
                            <p className="mt-1 text-lg font-semibold text-white">
                              {formatScore(candidate.tfidf_score)}
                            </p>
                          </div>
                          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-zinc-500">Skills</p>
                            <p className="mt-1 text-lg font-semibold text-white">
                              {formatScore(candidate.skill_match_score)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                          <h3 className="text-sm font-semibold text-white">
                            Summary
                          </h3>
                          <p className="mt-3 text-sm leading-6 text-zinc-300">
                            {candidate.summary}
                          </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-md border border-emerald-400/20 bg-emerald-400/10 p-4">
                            <h3 className="mb-3 text-sm font-semibold text-emerald-100">
                              Matching Skills
                            </h3>
                            {renderTags(
                              candidate.matching_skills,
                              "No matching skills returned.",
                              "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                            )}
                          </div>

                          <div className="rounded-md border border-amber-400/20 bg-amber-400/10 p-4">
                            <h3 className="mb-3 text-sm font-semibold text-amber-100">
                              Missing Skills
                            </h3>
                            {renderTags(
                              candidate.missing_skills,
                              "No missing skills returned.",
                              "border-amber-300/30 bg-amber-300/10 text-amber-100"
                            )}
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {renderList(
                            "Strengths",
                            candidate.strengths,
                            "No strengths returned.",
                            "border-emerald-400/20"
                          )}
                          {renderList(
                            "Concerns",
                            candidate.concerns,
                            "No concerns returned.",
                            "border-red-400/20"
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
