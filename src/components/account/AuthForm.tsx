"use client";

import Link from "next/link";
import { useActionState } from "react";
import { STORE } from "@/lib/config";

const field = "w-full border border-line bg-pearl px-4 py-3 text-sm outline-none focus:border-brown";
const label = "mb-2 block text-[11px] uppercase tracking-[0.2em] text-brown/80";

type Action = (prev: { error?: string } | undefined, f: FormData) => Promise<{ error?: string } | undefined>;

export function AuthForm({ mode, action, next }: { mode: "login" | "signup"; action: Action; next: string }) {
  const [state, run, pending] = useActionState(action, undefined);
  const signup = mode === "signup";
  const q = next !== "/account" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="grid lg:-mb-24 lg:min-h-[640px] lg:grid-cols-2">{/* -mb cancels the footer gap so the panel meets it */}
      <aside className={`relative hidden overflow-hidden bg-brown px-14 py-16 text-cream lg:flex lg:flex-col lg:justify-center ${signup ? "lg:order-last" : ""}`}>
        <svg aria-hidden viewBox="0 0 440 440" className="absolute -right-28 top-1/2 h-[520px] w-[520px] -translate-y-1/2 text-gold/60" fill="none" stroke="currentColor">
          <circle cx="220" cy="245" r="185" strokeWidth="1.25" />
          <circle cx="220" cy="245" r="172" strokeWidth="0.6" />
          <circle cx="220" cy="245" r="195" strokeWidth="1" strokeDasharray="1 9" />
          <path d="M220 60 192 26l12-16h32l12 16-28 34Z" strokeWidth="1.25" />
          <path d="M192 26h56M204 10l16 16 16-16M220 26v34" strokeWidth="0.6" />
        </svg>
        <p className="relative text-[11px] uppercase tracking-[0.4em] text-gold">✦ {STORE.name}</p>
        <p className="font-display relative mt-5 text-6xl font-light italic leading-[0.95] text-gold">Your Everyday</p>
        <p className="font-display relative text-7xl leading-[0.95] tracking-[0.06em]">
          ACCESS<span className="text-outline">ORIES</span>
        </p>
        <ul className="relative mt-10 space-y-3 text-sm text-cream/80">
          <li>✦ Track your orders and payments</li>
          <li>✦ Review the pieces you bought</li>
          <li>✦ Check out faster with saved details</li>
        </ul>
      </aside>
    <div className="mx-auto w-full max-w-md self-center px-5 py-16">
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
    </div>
  );
}
