import { randomBytes } from "node:crypto";
import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from "cloudinary";
import { IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/config";

// Reads CLOUDINARY_URL automatically; the three separate variables also work.
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const configured = () => Boolean(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME);

function upload(buffer: Buffer, options: UploadApiOptions) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "image", ...options }, (err, result) => (err || !result ? reject(err) : resolve(result)))
      .end(buffer);
  });
}

function validate(file: File) {
  if (!IMAGE_TYPES.includes(file.type)) return "Image must be a JPG, PNG or WebP file.";
  if (file.size > MAX_UPLOAD_BYTES) return "Image must be smaller than 3.5 MB.";
  if (!configured()) return "Image storage is not configured.";
  return null;
}

const uniqueName = () => `${Date.now().toString(36)}${randomBytes(4).toString("hex")}`;

type Result<T> = T | { error: string };

// Public product photo, served straight from Cloudinary's CDN.
export async function uploadProductImage(file: File): Promise<Result<{ url: string; publicId: string }>> {
  const invalid = validate(file);
  if (invalid) return { error: invalid };
  try {
    const r = await upload(Buffer.from(await file.arrayBuffer()), {
      folder: "evorn/products",
      public_id: uniqueName(),
    });
    return { url: r.secure_url, publicId: r.public_id };
  } catch (e) {
    console.error("Cloudinary product upload failed:", e);
    return { error: "Image upload failed. Please try again." };
  }
}

// Payment receipts are uploaded as `authenticated`, so only signed links (made for the admin) can open them.
export async function uploadReceipt(file: File): Promise<Result<{ publicId: string; format: string }>> {
  const invalid = validate(file);
  if (invalid) return { error: invalid };
  try {
    const r = await upload(Buffer.from(await file.arrayBuffer()), {
      folder: "evorn/receipts",
      public_id: uniqueName(),
      type: "authenticated",
    });
    return { publicId: r.public_id, format: r.format };
  } catch (e) {
    console.error("Cloudinary receipt upload failed:", e);
    return { error: "Receipt upload failed. Please try again." };
  }
}

export function receiptUrl(publicId: string, format: string) {
  return cloudinary.url(publicId, { type: "authenticated", sign_url: true, secure: true, format });
}

// Best effort: a failed cleanup must never block the admin's change.
export async function deleteImage(publicId: string | null | undefined, type: "upload" | "authenticated" = "upload") {
  if (!publicId || !configured()) return;
  try {
    await cloudinary.uploader.destroy(publicId, { type, resource_type: "image", invalidate: true });
  } catch (e) {
    console.error("Cloudinary delete failed:", e);
  }
}
