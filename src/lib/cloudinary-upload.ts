// Browser side of the signed direct upload: the server signs (see signUpload), the browser posts the file.
export type UploadParams = { cloudName: string; apiKey: string; folder: string; timestamp: number; signature: string };
export type UploadedImage = { url: string; publicId: string; width: number; height: number };

export async function uploadToCloudinary(file: File, params: UploadParams): Promise<UploadedImage> {
  const body = new FormData();
  body.set("file", file);
  body.set("api_key", params.apiKey);
  body.set("timestamp", String(params.timestamp));
  body.set("signature", params.signature);
  body.set("folder", params.folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`, { method: "POST", body });
  const json = await res.json();
  if (!res.ok || !json.secure_url) throw new Error(json?.error?.message ?? "Upload failed");
  return { url: json.secure_url, publicId: json.public_id, width: json.width, height: json.height };
}
