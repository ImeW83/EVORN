import { randomBytes } from "node:crypto";
import { put } from "@vercel/blob";

const EXT: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const MAX_BYTES = 5 * 1024 * 1024;

// Uploads an image to Vercel Blob and returns its public URL, or an error message.
export async function saveImage(file: File): Promise<{ url: string } | { error: string }> {
  const ext = EXT[file.type];
  if (!ext) return { error: "Image must be a JPG, PNG or WebP file." };
  if (file.size > MAX_BYTES) return { error: "Image must be smaller than 5 MB." };
  if (!process.env.BLOB_READ_WRITE_TOKEN) return { error: "Image storage is not configured (BLOB_READ_WRITE_TOKEN missing)." };
  try {
    const blob = await put(`products/${Date.now().toString(36)}${randomBytes(4).toString("hex")}${ext}`, file, {
      access: "public",
      contentType: file.type,
    });
    return { url: blob.url };
  } catch {
    return { error: "Image upload failed. Please try again." };
  }
}
