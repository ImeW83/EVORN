"use client";

import Link from "next/link";
import { useActionState } from "react";

const field = "w-full border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-brown";
const label = "mb-2 block text-[11px] uppercase tracking-[0.2em] text-brown/80";

type Action = (prev: { error?: string } | undefined, f: FormData) => Promise<{ error?: string } | undefined>;

export function AuthForm({ mode, action, next }: { mode: "login" | "signup"; action: Action; next: string }) {
  const [state, run, pending] = useActionState(action, undefined);
  const signup = mode === "signup";
  const q = next !== "/account" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-5xl">{signup ? "Create account" : "Welcome back"}</h1>
      <form action={run} className="mt-8 space-y-5">
        <input type="hidden" name="next" value={next} />
        {signup && (
          <div>
            <label htmlFor="name" className={label}>Full name</label>
            <input id="name" name="name" required autoComplete="name" className={field} />
          </div>
        )}
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className={field} />
        </div>
        <div>
          <label htmlFor="password" className={label}>Password{signup && " (min 8 characters)"}</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={signup ? 8 : undefined}
            autoComplete={signup ? "new-password" : "current-password"}
            className={field}
          />
        </div>
        {state?.error && <p role="alert" className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{state.error}</p>}
        <button disabled={pending} className="w-full bg-brown py-4 text-xs uppercase tracking-[0.25em] text-cream hover:bg-brown-dark disabled:opacity-60">
          {pending ? "Please wait…" : signup ? "Sign up" : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-brown/80">
        {signup ? "Already have an account? " : "New here? "}
        <Link href={`${signup ? "/login" : "/signup"}${q}`} className="underline">
          {signup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
