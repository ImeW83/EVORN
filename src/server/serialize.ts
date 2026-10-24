import { Types } from "mongoose";

// Converts lean Mongoose documents into plain objects that can cross into client components:
// ObjectIds become strings, `_id` becomes `id`, and `__v` is dropped.
export function plain<T>(value: unknown): T {
  return convert(value) as T;
}

function convert(value: unknown): unknown {
  if (value instanceof Types.ObjectId) return value.toString();
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(convert);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === "__v") continue;
      out[k === "_id" ? "id" : k] = convert(v);
    }
    return out;
  }
  return value;
}
