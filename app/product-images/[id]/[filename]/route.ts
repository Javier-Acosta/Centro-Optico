import { createPocketBase } from "../../../lib/pocketbase";

const allowedContentTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

function contentTypeFor(filename: string, upstreamContentType: string) {
  const normalized = upstreamContentType.split(";")[0].toLowerCase();
  if (allowedContentTypes.includes(normalized)) return normalized;
  if (/\.heic$/i.test(filename)) return "image/heic";
  if (/\.heif$/i.test(filename)) return "image/heif";
  return "";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; filename: string }> },
) {
  const { id, filename } = await params;
  if (!/^[a-z0-9]{15}$/.test(id) || !/^[a-zA-Z0-9_-]+\.(jpe?g|png|webp|heic|heif)$/i.test(filename)) {
    return new Response(null, { status: 404 });
  }

  // Keep the collection metadata required by PocketBase's file URL builder.
  // Only public product images are fetched; no administrator token is forwarded.
  const url = createPocketBase().files.getURL({ id, collectionName: "products" }, filename);
  try {
    const image = await fetch(url, { signal: AbortSignal.timeout(10000), redirect: "error" });
    if (!image.ok) return new Response(null, { status: image.status === 404 ? 404 : 502 });
    const contentType = contentTypeFor(filename, image.headers.get("content-type") || "");
    if (!contentType) return new Response(null, { status: 502 });
    return new Response(image.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
