"use client";

import Image from "next/image";
import { useActionState } from "react";
import { login } from "../actions";

export default function AdminLogin() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-brown px-5">
      <form action={action} className="w-full max-w-sm bg-cream p-8">
        <Image src="/brand/logo-brown.png" alt="EVORN" width={990} height={260} className="mx-auto h-10 w-auto" />
        <p className="mt-3 text-center text-[11px] uppercase tracking-[0.3em] text-tan">Admin</p>
        <label htmlFor="password" className="mt-8 mb-2 block text-[11px] uppercase tracking-[0.2em] text-brown/80">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="w-full border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-brown"
        />
        {state?.error && <p role="alert" className="mt-3 text-sm text-red-700">{state.error}</p>}
        <button disabled={pending} className="mt-6 w-full bg-brown py-3.5 text-xs uppercase tracking-[0.25em] text-cream hover:bg-brown-dark disabled:opacity-60">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
