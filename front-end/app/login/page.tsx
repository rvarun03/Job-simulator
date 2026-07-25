"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { api, saveAuthSession } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await api.login(
        email.trim(),
        password
      );

      saveAuthSession(data);

      router.push(data.role === "HR" ? "/candidate-ranking" : "/resume/upload");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-2xl shadow-black/30 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-between gap-10 border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <div className="space-y-5">
            <div className="inline-flex w-fit items-center rounded-md border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase text-blue-200">
              Account
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Login
              </h1>
              <p className="max-w-lg text-sm leading-7 text-zinc-400 sm:text-base">
                Access your AI job automation workspace with your registered credentials.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-300">
            New here?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-300 transition hover:text-blue-200"
            >
              Create an account
            </Link>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 bg-zinc-950/70 p-6 sm:p-8"
        >
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-300">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="h-12 rounded-md border border-white/10 bg-zinc-900 px-4 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-300 focus:ring-4 focus:ring-blue-300/10"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-300">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="h-12 rounded-md border border-white/10 bg-zinc-900 px-4 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-300 focus:ring-4 focus:ring-blue-300/10"
            />
          </label>

          {error && (
            <div className="rounded-md border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
