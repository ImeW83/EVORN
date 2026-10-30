"use client";

import { useState, type ReactNode } from "react";
import { Price } from "@/components/ui/Price";
import { priceRange, selectionExtra, type OptionGroup } from "@/lib/options";
import { AddToCart } from "./AddToCart";

type Props = {
  product: { id: string; slug: string; name: string; price: number; originalPrice: number | null; image: string | null; inStock: boolean; options: OptionGroup[] };
  children?: ReactNode; // shown between the price and the options (description, details)
  onPhoto?: (publicId: string) => void; // called with the photo linked to a choice when it is picked
};

// Price, option choices (Color, Design, Size...) and the add-to-cart button on the product page.
// The price shows a range until every option is chosen, then the exact price.
export function ProductPurchase({ product, children, onPhoto }: Props) {
  const groups = product.options;
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [missing, setMissing] = useState<string[]>([]);

  const selected = groups.filter((g) => picked[g.name]).map((g) => ({ name: g.name, value: picked[g.name] }));
  const extra = selectionExtra(groups, selected);
  const range = priceRange(product.price, groups);
  const base = extra ?? range.min - product.price; // extra cost shown: the chosen one, or the cheapest
  const original = product.originalPrice != null ? product.originalPrice + base : null;

  function pick(name: string, value: string) {
    setPicked({ ...picked, [name]: value });
    const image = groups.find((g) => g.name === name)?.choices.find((c) => c.label === value)?.image;
    if (image) onPhoto?.(image);
    setMissing(missing.filter((m) => m !== name));
  }

  function canAdd() {
    const notChosen = groups.filter((g) => !picked[g.name]).map((g) => g.name);
    setMissing(notChosen);
    return notChosen.length === 0;
  }

  return (
    <>
      <Price
        price={product.price + base}
        originalPrice={original}
        upTo={extra === null ? range.max - range.min : 0}
        className="mt-4 text-2xl text-brown"
      />
      {children}

      {groups.length > 0 && (
        <div className="mt-8 space-y-6">
          {groups.map((g, gi) => (
            <fieldset key={g.name} aria-describedby={missing.includes(g.name) ? `missing-${gi}` : undefined}>
              <legend className="mb-3 text-sm">
                Choose your {g.name.toLowerCase()}
                {picked[g.name] && <span className="text-brown/70">: {picked[g.name]}</span>}
              </legend>
              <div className="flex flex-wrap gap-2.5">
                {g.choices.map((c) => {
                  const on = picked[g.name] === c.label;
                  return (
                    <label
                      key={c.label}
                      className={`relative min-h-11 cursor-pointer rounded-full border px-5 py-2.5 text-sm transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brown ${
                        !c.available
                          ? "cursor-not-allowed border-line text-brown/40 line-through"
                          : on
                            ? "border-brown bg-brown text-cream"
                            : "border-line bg-pearl hover:border-brown"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`option-${g.name}`}
                        value={c.label}
                        checked={on}
                        disabled={!c.available}
                        onChange={() => pick(g.name, c.label)}
                        className="sr-only"
                      />
                      {c.label}
                      {c.extra > 0 && <span className={on ? "text-cream/80" : "text-brown/60"}> +{c.extra.toLocaleString("en-US")}</span>}
                      {!c.available && <span className="sr-only"> (sold out)</span>}
                    </label>
                  );
                })}
              </div>
              {missing.includes(g.name) && (
                <p id={`missing-${gi}`} role="alert" className="mt-2 text-sm text-red-800">
                  Please choose a {g.name.toLowerCase()}.
                </p>
              )}
            </fieldset>
          ))}
        </div>
      )}

      <div className="mt-8">
        <AddToCart
          product={{ ...product, price: product.price + (extra ?? 0) }}
          options={selected}
          canAdd={canAdd}
          disabled={!product.inStock}
        />
      </div>
    </>
  );
}
