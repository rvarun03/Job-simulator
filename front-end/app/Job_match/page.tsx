"use client";
import {api} from "../lib/api";
import { useRef, useState } from "react";

type MatchResult = {
    match_score: number;
    matched_skills: string[];
    missing_skills: string[];
    reasoning: string;
    recommendations: string[];
};

export default function Home() {

    const [resumeId, setResumeId] =
        useState("");

    const [jobDescription, setJobDescription] =
        useState("");

    const [status, setStatus] = 
        useState<string>("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [result, setResult] =
        useState<MatchResult | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
        
    // useEffect(() => {

    //     if (!resumeId) return;

    //     const ws = new WebSocket(
    //         `ws://localhost:8000/ws/${resumeId}`
    //     );

    //     ws.onmessage = (event) => {

    //         const data = JSON.parse(event.data);

    //         // LIVE STEP UPDATES
    //         if (data.step) {
    //             setStatus(data.step);
    //         }

    //         // FINAL RESULT FROM BACKEND
    //         if (data.result) {
    //             setResult(data.result);
    //         }

    //     };

    //     ws.onerror = () => {
    //         setError("WebSocket connection failed");
    //     };

    //     return () => ws.close();

    // }, [resumeId]);

    const handleSubmit = async () => {

    try {

        setLoading(true);
        setError("");
        setResult(null);
        setStatus("");

        const numericResumeId = resumeId ? Number(resumeId) : undefined;

        if (numericResumeId) {
            // 1. OPEN WS FIRST
            const ws = new WebSocket(
                `ws://localhost:8000/ws/${numericResumeId}`
            );

            wsRef.current = ws;

            ws.onmessage = (event) => {

                const data = JSON.parse(event.data);

                if (data.step) {
                    setStatus(data.step);
                }

                if (data.result) {
                    setResult(data.result);
                }
            };

            ws.onerror = () => {
                setError("WebSocket failed");
            };

            // WAIT FOR CONNECTION READY (IMPORTANT)
            await new Promise((resolve) => {
                ws.onopen = resolve;
            });
        }

        // 2. NOW CALL API
        const data = await api.matchJob(
            numericResumeId,
            jobDescription
        );
        setResult(data);

    } catch (err: unknown) {

        setError(err instanceof Error ? err.message : "Error");

    } finally {

        setLoading(false);
    }
};

   
    const matchedSkills = result?.matched_skills ?? [];
    const missingSkills = result?.missing_skills ?? [];
    const recommendations = result?.recommendations ?? [];
    const matchScore = Math.min(
        100,
        Math.max(0, Number(result?.match_score ?? 0))
    );

    return (

        <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">

                <section className="overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-2xl shadow-black/30">

                    <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">

                        <div className="flex flex-col justify-between gap-10 border-b border-white/10 bg-zinc-900 p-6 sm:p-8 lg:border-b-0 lg:border-r">

                            <div className="space-y-5">

                                <div className="inline-flex w-fit items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                                    Resume Match
                                </div>

                                <div className="space-y-3">

                                    <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                                        AI ATS Job Match
                                    </h1>

                                    <p className="max-w-lg text-sm leading-6 text-zinc-400 sm:text-base">
                                        Compare a saved resume against a job description and get a clean skill breakdown.
                                    </p>

                                </div>

                            </div>

                            <div className="grid grid-cols-3 gap-3 text-sm">

                                <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                                    <p className="text-xs text-zinc-500">Input</p>
                                    <p className="mt-1 font-semibold text-zinc-100">Latest Resume</p>
                                </div>

                                <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                                    <p className="text-xs text-zinc-500">Signal</p>
                                    <p className="mt-1 font-semibold text-zinc-100">Skills</p>
                                </div>

                                <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                                    <p className="text-xs text-zinc-500">Output</p>
                                    <p className="mt-1 font-semibold text-zinc-100">Score</p>
                                </div>

                            </div>

                        </div>

                        <div className="bg-zinc-950/70 p-6 sm:p-8">

                            <div className="flex flex-col gap-5">

                                <label className="flex flex-col gap-2">

                                    <span className="text-sm font-medium text-zinc-300">
                                        Resume ID (optional)
                                    </span>

                                    <input
                                        type="number"
                                        placeholder="Leave empty to use latest resume"
                                        className="h-12 rounded-md border border-white/10 bg-zinc-900 px-4 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                                        value={resumeId}
                                        onChange={(e) =>
                                            setResumeId(
                                                e.target.value
                                            )
                                        }
                                    />

                                </label>

                                <label className="flex flex-col gap-2">

                                    <span className="text-sm font-medium text-zinc-300">
                                        Job Description
                                    </span>

                                    <textarea
                                        placeholder="Paste the job description here"
                                        className="min-h-64 resize-y rounded-md border border-white/10 bg-zinc-900 px-4 py-3 text-base leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                                        value={jobDescription}
                                        onChange={(e) =>
                                            setJobDescription(
                                                e.target.value
                                            )
                                        }
                                    />

                                </label>

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="mt-1 flex h-12 items-center justify-center rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                                >
                                    {loading
                                        ? "Analyzing..."
                                        : "Analyze Match"}
                                </button>
                                    {status && (
                                        <div className="mt-4 rounded-md border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-100">
                                            <p>Current Step: {status}</p>
                                        </div>
                                    )}            
                                {error && (

                                    <div className="rounded-md border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">

                                        <p>{error}</p>

                                    </div>

                                )}

                            </div>

                        </div>

                    </div>

                </section>

                {result && (

                    <section className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">

                        <div className="rounded-lg border border-white/10 bg-zinc-900 p-6 shadow-xl shadow-black/20">

                            <p className="text-sm font-medium text-zinc-400">
                                Match Score
                            </p>

                            <div className="mt-4 flex items-end gap-2">

                                <p className="text-6xl font-semibold tracking-tight text-white">
                                    {result.match_score}
                                </p>

                                <span className="pb-2 text-2xl font-semibold text-cyan-200">
                                    %
                                </span>

                            </div>

                            <div className="mt-6 h-3 overflow-hidden rounded-full bg-zinc-800">

                                <div
                                    className="h-full rounded-full bg-cyan-300"
                                    style={{ width: `${matchScore}%` }}
                                />

                            </div>

                            <p className="mt-5 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
                                {matchedSkills.length} of {matchedSkills.length + missingSkills.length} technical skills matched
                            </p>

                        </div>

                        <div className="grid gap-5 md:grid-cols-2">

                            <div className="rounded-lg border border-white/10 bg-zinc-900 p-5">

                                <h2 className="text-lg font-semibold text-white">
                                    Matched Skills
                                </h2>

                                <div className="mt-4 flex flex-wrap gap-2">

                                    {matchedSkills.length > 0 ? matchedSkills.map(
                                        (skill: string) => (

                                            <span
                                                key={skill}
                                                className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-sm font-medium text-emerald-100"
                                            >
                                                {skill}
                                            </span>

                                        )
                                    ) : (
                                        <p className="text-sm leading-6 text-zinc-500">
                                            No explicit skill matches were identified.
                                        </p>
                                    )}

                                </div>

                            </div>

                            <div className="rounded-lg border border-white/10 bg-zinc-900 p-5">

                                <h2 className="text-lg font-semibold text-white">
                                    Missing Skills
                                </h2>

                                <div className="mt-4 flex flex-wrap gap-2">

                                    {missingSkills.length > 0 ? (
                                        missingSkills.map(
                                            (skill: string) => (

                                                <span
                                                    key={skill}
                                                    className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-sm font-medium text-amber-100"
                                                >
                                                    {skill}
                                                </span>

                                            )
                                        )
                                    ) : (
                                        <p className="text-sm text-zinc-400">
                                            No missing skills reported.
                                        </p>
                                    )}

                                </div>

                            </div>

                            <div className="rounded-lg border border-white/10 bg-zinc-900 p-5 md:col-span-2">

                                <h2 className="text-lg font-semibold text-white">
                                    Reasoning
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-zinc-300">
                                    {result.reasoning}
                                </p>

                            </div>

                            <div className="rounded-lg border border-white/10 bg-zinc-900 p-5 md:col-span-2">

                                <h2 className="text-lg font-semibold text-white">
                                    Recommendations
                                </h2>

                                {recommendations.length > 0 ? (
                                    <ul className="mt-4 space-y-3">

                                        {recommendations.map(
                                            (rec: string) => (

                                                <li
                                                    key={rec}
                                                    className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-zinc-300"
                                                >
                                                    {rec}
                                                </li>

                                            )
                                        )}

                                    </ul>
                                ) : (
                                    <p className="mt-3 text-sm text-zinc-400">
                                        No recommendations returned.
                                    </p>
                                )}

                            </div>

                        </div>

                    </section>

                )}

            </div>

        </main>

    );

}
