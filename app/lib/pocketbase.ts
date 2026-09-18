import PocketBase from "pocketbase";

export type Product = {
  id: string;
  name: string;
  description?: string;
  priceMinor: number;
  currency: string;
  published: boolean;
  image?: string;
  imageUrl?: string;
};

export type OrderStatus = "pending" | "approved" | "rejected";

const url = process.env.POCKETBASE_URL;

if (!url) {
  throw new Error("POCKETBASE_URL no esta definida.");
}

export function createPocketBase() {
  return new PocketBase(url);
}

export async function createSuperuserPocketBase() {
  const email = process.env.POCKETBASE_SUPERUSER_EMAIL;
  const password = process.env.POCKETBASE_SUPERUSER_PASSWORD;

  if (!email || !password) {
    throw new Error("Faltan POCKETBASE_SUPERUSER_EMAIL o POCKETBASE_SUPERUSER_PASSWORD.");
  }

  const pb = createPocketBase();
  await pb.collection("_superusers").authWithPassword(email, password);
  return pb;
}

export function productImageUrl(product: Product) {
  if (!product.image) return "";
  return createPocketBase().files.getURL(product, product.image, { thumb: "900x900" });
}

function mapProduct(record: Record<string, unknown>): Product {
  const product = {
    id: String(record.id),
    name: String(record.name || ""),
    description: typeof record.description === "string" ? record.description : "",
    priceMinor: Number(record.priceMinor || 0),
    currency: String(record.currency || "ARS"),
    published: Boolean(record.published),
    image: typeof record.image === "string" ? record.image : "",
  } satisfies Product;

  return { ...product, imageUrl: productImageUrl(product) };
}

export async function listPublishedProducts() {
  const pb = createPocketBase();
  const records = await pb.collection("products").getFullList({
    filter: "published = true",
    sort: "-created",
    requestKey: null,
  });
  return records.map((record) => mapProduct(record as unknown as Record<string, unknown>));
}

export async function listAllProductsForSeller() {
  const pb = await createSuperuserPocketBase();
  const records = await pb.collection("products").getFullList({
    sort: "-created",
    requestKey: null,
  });
  return records.map((record) => mapProduct(record as unknown as Record<string, unknown>));
}

export async function getPublishedProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const quotedIds = ids.map((id) => `id = "${id.replaceAll('"', "")}"`).join(" || ");
  const pb = createPocketBase();
  const records = await pb.collection("products").getFullList({
    filter: `published = true && (${quotedIds})`,
    requestKey: null,
  });
  return records.map((record) => mapProduct(record as unknown as Record<string, unknown>));
}
