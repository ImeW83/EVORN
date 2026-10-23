import { get } from "@vercel/blob";
import { BLOB_PREFIX } from "@/lib/uploads";

// Product photos live in a private Blob store; this route serves them publicly.
export async function GET(_req: Request, { params }: RouteContext<"/media/[file]">) {
  const { file } = await params;
  // Only plain file names we generated ourselves.
  if (!/^[\w-]+\.(jpg|png|webp)$/.test(file)) return new Response("Not found", { status: 404 });
  try {
    const result = await get(`${BLOB_PREFIX}${file}`, { access: "private" });
    if (!result || result.statusCode !== 200) return new Response("Not found", { status: 404 });
    return new Response(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
