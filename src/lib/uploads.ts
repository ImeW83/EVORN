import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const EXT: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const MAX_BYTES = 5 * 1024 * 1024;

// Saves an uploaded image and returns its public URL, or an error message.
export async function saveImage(file: File): Promise<{ url: string } | { error: string }> {
  const ext = EXT[file.type];
  if (!ext) return { error: "Image must be a JPG, PNG or WebP file." };
  if (file.size > MAX_BYTES) return { error: "Image must be smaller than 5 MB." };
  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now().toString(36)}${randomBytes(4).toString("hex")}${ext}`;
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${name}` };
}
