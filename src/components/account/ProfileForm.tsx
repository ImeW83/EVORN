"use client";

import { useActionState } from "react";
import { updateProfile } from "@/actions/store/account";
import { PHONE_HINT } from "@/lib/phone";

const field = "w-full border border-line bg-pearl px-4 py-3 text-sm outline-none focus:border-brown";
const label = "mb-2 block text-[11px] uppercase tracking-[0.2em] text-brown/80";

type Profile = { name: string; email: string; phone: string | null; address: string | null; city: string | null };

export function ProfileForm({ user }: { user: Profile }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  return (
    <form action={action} className="mt-6 space-y-5">
      <div>
        <label htmlFor="email" className={label}>Email</label>
        <input id="email" value={user.email} disabled className={`${field} opacity-60`} />
      </div>
      <div>
        <label htmlFor="name" className={label}>Full name</label>
        <input id="name" name="name" defaultValue={user.name} required className={field} />
      </div>
      <div>
        <label htmlFor="phone" className={label}>Phone</label>
        <input id="phone" name="phone" type="tel" placeholder={PHONE_HINT} defaultValue={user.phone ?? ""} className={field} />
      </div>
      <div>
        <label htmlFor="address" className={label}>Delivery address</label>
        <input id="address" name="address" defaultValue={user.address ?? ""} className={field} />
      </div>
      <div>
        <label htmlFor="city" className={label}>City</label>
        <input id="city" name="city" defaultValue={user.city ?? ""} className={field} />
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state?.saved && <p role="status" className="text-sm text-green-800">Saved.</p>}
      <button disabled={pending} className="bg-brown px-10 py-3.5 text-xs uppercase tracking-[0.25em] text-cream hover:bg-brown-dark disabled:opacity-60">
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
