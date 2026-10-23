import { randomBytes } from "node:crypto";
import { put } from "@vercel/blob";

export const BLOB_PREFIX = "products/";

const EXT: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const MAX_BYTES = 5 * 1024 * 1024;

// Uploads an image to the (private) Vercel Blob store and returns the site URL it is served from.
export async function saveImage(file: File): Promise<{ url: string } | { error: string }> {
  const ext = EXT[file.type];
  if (!ext) return { error: "Image must be a JPG, PNG or WebP file." };
  if (file.size > MAX_BYTES) return { error: "Image must be smaller than 5 MB." };
  // On Vercel the Blob SDK authenticates via BLOB_STORE_ID (OIDC); locally a BLOB_READ_WRITE_TOKEN is needed.
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) return { error: "Image storage is not configured." };
  const name = `${Date.now().toString(36)}${randomBytes(4).toString("hex")}${ext}`;
  try {
    await put(`${BLOB_PREFIX}${name}`, file, { access: "private", contentType: file.type });
    return { url: `/media/${name}` };
  } catch (e) {
    console.error("Blob upload failed:", e);
    return { error: "Image upload failed. Please try again." };
  }
}
