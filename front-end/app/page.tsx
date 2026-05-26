import Link from "next/link";

const features = [
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
  },
];

export default function Home() {
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
                Your AI workspace for faster, sharper job applications.
              </h1>

              <p className="max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
                Use your saved resume to generate personalized cover letters,
                check how well you match a job description, improve your resume
                for ATS systems, and chat with an assistant about your resume.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/Job_match"
                className="flex h-12 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Start with Job Match
              </Link>
              <Link
                href="/Chat"
                className="flex h-12 items-center justify-center rounded-md border border-white/15 px-5 text-sm font-semibold text-zinc-100 transition hover:bg-white/10"
              >
                Open Resume Chat
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-zinc-500">Input</p>
              <p className="mt-1 text-xl font-semibold text-white">
                Resume ID + Job Description
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-zinc-500">AI Helps With</p>
              <p className="mt-1 text-xl font-semibold text-white">
                Matching, writing, optimization, and Q&A
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
              Jump directly into any tool from here.
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
