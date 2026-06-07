"use client";

import { useRef, useState } from "react";
import {api} from "../lib/api";

type ResumeImprovementResult = {
    summary_improvements: string[];
    missing_keywords_to_add: string[];
    project_improvements: string[];
    skill_recommendations: string[];
    ats_optimization_tips: string[];
};

export default function ResumeImprovementPage() {

    const wsRef = useRef<WebSocket | null>(null);

    const [resumeId, setResumeId] = useState("");

    const [jobDescription, setJobDescription] = useState("");

    const [status, setStatus] =
    useState("");

    

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [result, setResult] =
        useState<ResumeImprovementResult | null>(null);

    const handleGenerate = async () => {

        try {

            setLoading(true);

            setError("");

            setResult(null);

            setStatus("");

            const numericResumeId = resumeId ? Number(resumeId) : undefined;

            if (numericResumeId) {
                // OPEN WS FIRST

                const ws = new WebSocket(
                    `ws://localhost:8000/ws/${numericResumeId}`
                );

                wsRef.current = ws;

                ws.onmessage = (event) => {

                    const data = JSON.parse(
                        event.data
                    );

                    // STEP UPDATES

                    if (data.step) {
                        setStatus(data.step);
                    }

                    // FINAL RESULT

                    if (data.result) {
                        setResult(data.result);
                    }
                };

                ws.onerror = () => {

                    setError(
                        "WebSocket failed"
                    );
                };

                // WAIT FOR CONNECTION

                await new Promise((resolve) => {
                    ws.onopen = resolve;
                });
            }
            const data =
                await api.generateResumeImprovements(
                    numericResumeId,
                    jobDescription
                );

            setResult(data);

        } catch (err: unknown) {

            setError(
                err instanceof Error ? err.message :
                "Failed to generate improvements"
            );

        } finally {

            setLoading(false);

        }

    };

    const renderList = (
        title: string,
        items: string[],
        borderColor: string,
        bgColor: string,
        textColor: string
    ) => (

        <div
            className={`rounded-xl border ${borderColor} ${bgColor} p-5`}
        >

            <h2 className="text-lg font-semibold text-white">
                {title}
            </h2>

            {items.length > 0 ? (

                <ul className="mt-4 space-y-3">

                    {items.map((item, index) => (

                        <li
                            key={index}
                            className={`rounded-lg border border-white/10 px-4 py-3 text-sm leading-6 ${textColor} bg-white/[0.03]`}
                        >
                            {item}
                        </li>

                    ))}

                </ul>

            ) : (

                <p className="mt-4 text-sm text-zinc-400">
                    No suggestions available.
                </p>

            )}

        </div>

    );

    return (

        <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100">

            <div className="mx-auto max-w-7xl space-y-8">

                {/* HERO */}

                <section className="rounded-2xl border border-white/10 bg-zinc-900 overflow-hidden shadow-2xl shadow-black/30">

                    <div className="grid lg:grid-cols-[0.9fr_1.1fr]">

                        {/* LEFT */}

                        <div className="border-b border-white/10 p-8 lg:border-b-0 lg:border-r">

                            <div className="space-y-6">

                                <div className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                                    Resume Optimization
                                </div>

                                <div className="space-y-3">

                                    <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                                        AI Resume Improvement
                                    </h1>

                                    <p className="max-w-lg text-sm leading-7 text-zinc-400 sm:text-base">
                                        Improve your resume using ATS analysis,
                                        missing keyword detection, and AI-powered
                                        resume rewriting suggestions.
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* RIGHT */}

                        <div className="bg-zinc-950/70 p-8">

                            <div className="space-y-5">

                                {/* RESUME ID */}

                                <label className="flex flex-col gap-2">

                                    <span className="text-sm font-medium text-zinc-300">
                                        Resume ID (optional)
                                    </span>

                                    <input
                                        type="number"
                                        placeholder="Leave empty to use latest resume"
                                        value={resumeId}
                                        onChange={(e) =>
                                            setResumeId(
                                                e.target.value
                                            )
                                        }
                                        className="h-12 rounded-lg border border-white/10 bg-zinc-900 px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                                    />

                                </label>

                                {/* JOB DESCRIPTION */}

                                <label className="flex flex-col gap-2">

                                    <span className="text-sm font-medium text-zinc-300">
                                        Job Description
                                    </span>

                                    <textarea
                                        placeholder="Paste the target job description"
                                        value={jobDescription}
                                        onChange={(e) =>
                                            setJobDescription(
                                                e.target.value
                                            )
                                        }
                                        className="min-h-64 resize-y rounded-lg border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                                    />

                                </label>

                                {/* BUTTON */}

                                <button
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="flex h-12 w-full items-center justify-center rounded-lg bg-cyan-300 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                                >
                                    {loading
                                        ? "Generating Improvements..."
                                        : "Generate Improvements"}
                                </button>

                                {/* ERROR */}

                                {error && (

                                    <div className="rounded-lg border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">

                                        {error}

                                    </div>

                                )}

                            </div>

                        </div>

                    </div>

                </section>

                {/* RESULTS */}

                {result && (

                    <section className="grid gap-6 lg:grid-cols-2">

                        {renderList(
                            "Summary Improvements",
                            result.summary_improvements,
                            "border-cyan-400/20",
                            "bg-cyan-400/5",
                            "text-cyan-50"
                        )}

                        {renderList(
                            "Missing Keywords",
                            result.missing_keywords_to_add,
                            "border-amber-400/20",
                            "bg-amber-400/5",
                            "text-amber-50"
                        )}

                        {renderList(
                            "Project Improvements",
                            result.project_improvements,
                            "border-emerald-400/20",
                            "bg-emerald-400/5",
                            "text-emerald-50"
                        )}

                        {renderList(
                            "Skill Recommendations",
                            result.skill_recommendations,
                            "border-purple-400/20",
                            "bg-purple-400/5",
                            "text-purple-50"
                        )}

                        <div className="lg:col-span-2">

                            {renderList(
                                "ATS Optimization Tips",
                                result.ats_optimization_tips,
                                "border-pink-400/20",
                                "bg-pink-400/5",
                                "text-pink-50"
                            )}

                        </div>

                    </section>

                )}
                {status && (

                <div className="mt-4 rounded-md border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-100">

                    <p>
                        Current Step: {status}
                    </p>

                </div>

            )}
            </div>

        </main>

    );

}
