"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to sign in.");
      }

      router.replace("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy px-5 py-14 sm:px-6">
      <div className="hero-grid absolute inset-0" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_0%,rgba(255,217,26,0.08),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center">
          <Logo variant="navy" />
        </div>

        <div className="admin-panel mt-9 p-7 sm:p-9">
          <span className="block text-center text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-gold">
            HUG Photos
          </span>
          <h1 className="mt-3 text-center text-2xl font-light tracking-tight text-white">
            Administrator sign in
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-mist/70">
            Enter your credentials to manage the HUG Photos collection.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="username" className="admin-label">
                Username
              </label>
              <input
                id="username"
                name="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                autoComplete="username"
                autoFocus
                className="admin-input mt-2"
                placeholder="Username"
              />
            </div>

            <div>
              <label htmlFor="password" className="admin-label">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  className="admin-input pr-16"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 px-4 text-xs font-medium uppercase tracking-[0.12em] text-mist/60 transition-colors hover:text-gold"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              >
                {error}
              </p>
            ) : null}

            <button type="submit" disabled={submitting} className="admin-btn-primary w-full py-4">
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-mist/60">
          <Link href="/" className="transition-colors hover:text-gold">
            &larr; Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
