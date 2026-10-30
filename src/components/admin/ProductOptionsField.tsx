"use client";

/* eslint-disable @next/next/no-img-element -- small Cloudinary thumbnails, already resized (see cloudinaryUrl) */

import { Fragment, useState } from "react";
import { CHOICE_SUGGESTIONS, OPTION_LIMITS, OPTION_NAMES, type OptionGroup } from "@/lib/options";
import { cloudinaryUrl } from "@/lib/product";
import type { ProductImage } from "@/server/types";

const field = "w-full border border-line bg-pearl px-3 py-2 text-sm outline-none focus:border-brown";
const small = "text-xs uppercase tracking-[0.2em] text-brown/70 underline underline-offset-4 hover:text-brown";

const thumb = (url: string) => cloudinaryUrl(url, "c_fill,w_96,h_120,q_auto,f_auto");

// Edits the product's option groups (Color, Design, Size...) and submits them as JSON in a hidden "options" field.
// `images` are the product's current photos; a choice can be linked to one so the gallery shows it when picked.
export function ProductOptionsField({ initial, images }: { initial: OptionGroup[]; images: ProductImage[] }) {
  const [groups, setGroups] = useState<OptionGroup[]>(initial);
  const [picking, setPicking] = useState<string | null>(null); // "group-choice" whose photo picker is open
  const photoOf = (publicId: string | null | undefined) => images.find((i) => i.publicId === publicId) ?? null;

  const setGroup = (gi: number, g: OptionGroup) => setGroups(groups.map((x, i) => (i === gi ? g : x)));
  const unusedName = OPTION_NAMES.find((n) => !groups.some((g) => g.name === n)) ?? OPTION_NAMES[0];

  return (
    <fieldset>
      <legend className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-brown/80">Options (colour, design, size)</legend>
      <p className="mb-4 text-xs text-brown/70">
        Customers must pick one choice from each option before adding to cart. An extra price is added to the selling
        price, e.g. 300 for &quot;With stones&quot;. Untick &quot;Available&quot; when a choice runs out. Link a photo to a
        choice (e.g. the silver photo to &quot;Silver&quot;) and the product page shows it when that choice is picked.
      </p>
      <input type="hidden" name="options" value={JSON.stringify(groups)} />
      {Object.entries(CHOICE_SUGGESTIONS).map(([name, values]) => (
        <datalist key={name} id={`choices-${name}`}>
          {values.map((v) => <option key={v} value={v} />)}
        </datalist>
      ))}

      <div className="space-y-5">
        {groups.map((g, gi) => (
          <div key={gi} className="border border-line bg-sand/30 p-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label htmlFor={`opt-${gi}`} className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-brown/70">Option</label>
                <select id={`opt-${gi}`} value={g.name} onChange={(e) => setGroup(gi, { ...g, name: e.target.value })} className={field}>
                  {/* Each option once per product: hide names other options already use. */}
                  {OPTION_NAMES.filter((n) => n === g.name || !groups.some((x) => x.name === n)).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={() => setGroups(groups.filter((_, i) => i !== gi))} className={`${small} pb-2`}>
                Remove option
              </button>
            </div>

            <table className="mt-4 w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-[0.15em] text-brown/70">
                <tr>
                  <th className="pb-2 font-normal">Choice</th>
                  <th className="w-32 pb-2 font-normal">Extra (LKR)</th>
                  <th className="w-24 pb-2 text-center font-normal">Available</th>
                  <th className="w-20 pb-2 text-center font-normal">Photo</th>
                  <th className="w-10 pb-2"><span className="sr-only">Remove</span></th>
                </tr>
              </thead>
              <tbody>
                {g.choices.map((c, ci) => {
                  const setChoice = (patch: Partial<typeof c>) =>
                    setGroup(gi, { ...g, choices: g.choices.map((x, i) => (i === ci ? { ...x, ...patch } : x)) });
                  const id = `${gi}-${ci}`;
                  const photo = photoOf(c.image);
                  const name = c.label || `choice ${ci + 1}`;
                  return (
                    <Fragment key={ci}>
                    <tr>
                      <td className="py-1 pr-2">
                        <input
                          aria-label={`${g.name || "Option"} choice ${ci + 1}`}
                          list={CHOICE_SUGGESTIONS[g.name] ? `choices-${g.name}` : undefined}
                          value={c.label}
                          maxLength={OPTION_LIMITS.label}
                          onChange={(e) => setChoice({ label: e.target.value })}
                          placeholder={g.name === "Size" ? "e.g. Size 7" : g.name === "Design" ? "e.g. With stones" : "e.g. Gold"}
                          className={field}
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <input
                          aria-label={`Extra price for ${c.label || `choice ${ci + 1}`}`}
                          type="number"
                          min={0}
                          step={1}
                          value={c.extra}
                          onChange={(e) => setChoice({ extra: Number(e.target.value) })}
                          className={field}
                        />
                      </td>
                      <td className="py-1 text-center">
                        <input
                          aria-label={`${c.label || `Choice ${ci + 1}`} available`}
                          type="checkbox"
                          checked={c.available}
                          onChange={(e) => setChoice({ available: e.target.checked })}
                        />
                      </td>
                      <td className="py-1 text-center">
                        <button
                          type="button"
                          aria-expanded={picking === id}
                          aria-label={photo ? `Change photo for ${name}` : `Link a photo to ${name}`}
                          onClick={() => setPicking(picking === id ? null : id)}
                          className="mx-auto flex h-10 w-8 items-center justify-center overflow-hidden border border-line bg-pearl text-xs text-brown/60 hover:border-brown"
                        >
                          {photo ? <img src={thumb(photo.url)} alt="" className="h-full w-full object-cover" /> : "+"}
                        </button>
                      </td>
                      <td className="py-1 text-right">
                        <button
                          type="button"
                          aria-label={`Remove ${c.label || `choice ${ci + 1}`}`}
                          onClick={() => setGroup(gi, { ...g, choices: g.choices.filter((_, i) => i !== ci) })}
                          className="h-8 w-8 text-brown/60 hover:text-brown"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                    {picking === id && (
                      <tr>
                        <td colSpan={5} className="pb-3 pt-1">
                          <div className="border border-line bg-pearl p-3">
                            {images.length === 0 ? (
                              <p className="text-xs text-brown/70">Add photos in the Photos section above first.</p>
                            ) : (
                              <>
                                <p className="mb-2 text-xs text-brown/70">Photo shown when a customer picks &quot;{name}&quot;:</p>
                                <div className="flex flex-wrap gap-2">
                                  {images.map((img, n) => (
                                    <button
                                      key={img.publicId}
                                      type="button"
                                      aria-label={`Photo ${n + 1}`}
                                      aria-pressed={c.image === img.publicId}
                                      onClick={() => { setChoice({ image: img.publicId }); setPicking(null); }}
                                      className={`h-15 w-12 overflow-hidden border-2 ${c.image === img.publicId ? "border-brown" : "border-transparent hover:border-line"}`}
                                    >
                                      <img src={thumb(img.url)} alt="" className="h-full w-full object-cover" />
                                    </button>
                                  ))}
                                  <button
                                    type="button"
                                    aria-pressed={!photo}
                                    onClick={() => { setChoice({ image: null }); setPicking(null); }}
                                    className={`h-15 border-2 px-3 text-xs text-brown/70 ${!photo ? "border-brown" : "border-line hover:border-brown"}`}
                                  >
                                    No photo
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
            {g.choices.length < OPTION_LIMITS.choices && (
              <button
                type="button"
                onClick={() => setGroup(gi, { ...g, choices: [...g.choices, { label: "", extra: 0, available: true, image: null }] })}
                className={`${small} mt-3`}
              >
                + Add choice
              </button>
            )}
          </div>
        ))}
      </div>

      {groups.length < OPTION_LIMITS.groups && (
        <button
          type="button"
          onClick={() => setGroups([...groups, { name: unusedName, choices: [{ label: "", extra: 0, available: true, image: null }] }])}
          className="mt-4 border border-brown px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-brown hover:bg-brown hover:text-cream"
        >
          + Add option
        </button>
      )}
    </fieldset>
  );
}
