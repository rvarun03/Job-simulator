"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function ChatStart() {
  const router = useRouter();
  const [resumeId, setResumeId] = useState("");

  const openChat = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedResumeId = resumeId.trim();

    router.push(`/Chat/${trimmedResumeId || "latest"}`);
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <section className="mx-auto grid w-full max-w-5xl gap-8 rounded-lg border border-white/10 bg-zinc-900 p-6 shadow-2xl shadow-black/30 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-center gap-5">
          <div className="inline-flex w-fit items-center rounded-md border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase text-cyan-200">
            Resume Chat
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Chat with your resume
            </h1>
            <p className="max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
              Enter a saved resume ID to ask questions about experience,
              projects, skills, and job-fit details.
            </p>
          </div>
        </div>

        <form
          onSubmit={openChat}
          className="flex flex-col justify-center gap-5 rounded-md border border-white/10 bg-zinc-950/70 p-5 sm:p-6"
        >
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-300">
              Resume ID (optional)
            </span>
            <input
              type="number"
              value={resumeId}
              onChange={(event) => setResumeId(event.target.value)}
              placeholder="Leave empty to use latest resume"
              className="h-12 rounded-md border border-white/10 bg-zinc-900 px-4 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
            />
          </label>

          <button
            type="submit"
            className="flex h-12 items-center justify-center rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            Open Chat
          </button>
        </form>
      </section>
    </main>
  );
}
