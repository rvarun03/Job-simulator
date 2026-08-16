"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  getAuthSessionFromSnapshot,
  getAuthSessionSnapshot,
  getServerAuthSessionSnapshot,
  subscribeToAuthSession,
} from "./lib/api";

const userFeatures = [
  {
    title: "Resume Upload",
    description:
      "Upload a PDF or DOCX resume and save it for cover letters, matching, improvements, and chat.",
    href: "/resume/upload",
    cta: "Upload resume",
  },
  {
    title: "Cover Letter Generator",
    description:
      "Create a tailored cover letter from your saved resume and a job description.",
    href: "/Cover_letter",
    cta: "Write cover letter",
  },
  {
    title: "Job Match Analysis",
    description:
      "Compare your resume with a role and see match score, missing skills, and next steps.",
    href: "/Job_match",
    cta: "Analyze match",
  },
  {
    title: "Resume Improvements",
    description:
      "Get ATS-focused suggestions, missing keywords, project edits, and skill recommendations.",
    href: "/Resume_Improvements",
    cta: "Improve resume",
  },
  {
    title: "Resume Chat",
    description:
      "Ask questions about a saved resume and get focused answers through the chat assistant.",
    href: "/Chat",
    cta: "Open chat",
  }
];

const hrFeatures = [
  {
    title: "Candidate Ranking",
    description:
      "Upload multiple candidate resumes and rank them against a job description for HR screening.",
    href: "/candidate-ranking",
    cta: "Rank candidates",
  },
];

export default function Home() {
  const authSessionSnapshot = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthSessionSnapshot,
    getServerAuthSessionSnapshot
  );
  const session = getAuthSessionFromSnapshot(authSessionSnapshot);
  const isHr = session?.role === "HR";
  const features = isHr ? hrFeatures : userFeatures;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <section className="grid gap-8 rounded-lg border border-white/10 bg-zinc-900 p-6 shadow-2xl shadow-black/30 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
          <div className="flex flex-col justify-center gap-6">
            <div className="inline-flex w-fit items-center rounded-md border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase text-blue-200">
              AI Job Automation
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {isHr
                  ? "Rank the strongest candidates faster."
                  : "Your AI workspace for faster, sharper job applications."}
              </h1>

              <p className="max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
                {isHr
                  ? "Upload candidate resumes, compare them against the job description, and review an AI-assisted ranking for your hiring workflow."
                  : "Use your saved resume to generate personalized cover letters, check how well you match a job description, improve your resume for ATS systems, and chat with an assistant about your resume."}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={isHr ? "/candidate-ranking" : "/resume/upload"}
                className="flex h-12 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                {isHr ? "Rank Candidates" : "Upload Resume"}
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-zinc-500">Input</p>
              <p className="mt-1 text-xl font-semibold text-white">
                {isHr
                  ? "Candidate Resumes + Job Description"
                  : "Resume ID optional + Job Description"}
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-zinc-500">AI Helps With</p>
              <p className="mt-1 text-xl font-semibold text-white">
                {isHr
                  ? "Screening, comparison, and ranking"
                  : "Matching, writing, optimization, and Q&A"}
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-zinc-500">Output</p>
              <p className="mt-1 text-xl font-semibold text-white">
                Clear recommendations you can act on
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Available Features
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              {isHr
                ? "Open the candidate screening tool available to HR accounts."
                : "Jump directly into any job-seeker tool from here."}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group rounded-lg border border-white/10 bg-zinc-900 p-5 transition hover:border-blue-400/50 hover:bg-zinc-900/80"
              >
                <div className="flex min-h-40 flex-col justify-between gap-5">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-6 text-zinc-400">
                      {feature.description}
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-blue-300 transition group-hover:text-blue-200">
                    {feature.cta}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
