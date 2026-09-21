import { createPocketBase } from "../../../lib/pocketbase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; filename: string }> },
) {
  const { id, filename } = await params;
  if (!/^[a-z0-9]{15}$/.test(id) || !/^[a-zA-Z0-9_-]+\.(jpe?g|png|webp)$/i.test(filename)) {
    return new Response(null, { status: 404 });
  }

  // Keep the collection metadata required by PocketBase's file URL builder.
  // Only public product images are fetched; no administrator token is forwarded.
  const url = createPocketBase().files.getURL({ id, collectionName: "products" }, filename);
  try {
    const image = await fetch(url, { signal: AbortSignal.timeout(10000), redirect: "error" });
    if (!image.ok) return new Response(null, { status: image.status === 404 ? 404 : 502 });
    const contentType = image.headers.get("content-type")?.split(";")[0] || "";
    if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
      return new Response(null, { status: 502 });
    }
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
