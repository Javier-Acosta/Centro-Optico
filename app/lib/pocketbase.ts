import PocketBase from "pocketbase";

export type Product = {
  id: string;
  name: string;
  description?: string;
  priceMinor: number;
  currency: string;
  published: boolean;
  sold: boolean;
  image?: string;
  imageUrl?: string;
  created: string;
  updated: string;
};

export type OrderStatus = "pending" | "approved" | "rejected";

export const defaultStoreName = "Tienda Cata";

function pocketBaseUrl() {
  const url = process.env.POCKETBASE_URL;

  if (!url) {
    throw new Error("POCKETBASE_URL no esta definida.");
  }

  return url;
}

export function createPocketBase() {
  return new PocketBase(pocketBaseUrl());
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
  return `/product-images/${encodeURIComponent(product.id)}/${encodeURIComponent(product.image)}`;
}

function mapProduct(record: Record<string, unknown>): Product {
  const product = {
    id: String(record.id),
    name: String(record.name || ""),
    description: typeof record.description === "string" ? record.description : "",
    priceMinor: Number(record.priceMinor || 0),
    currency: String(record.currency || "ARS"),
    published: Boolean(record.published),
    sold: Boolean(record.sold),
    image: typeof record.image === "string" ? record.image : "",
    created: String(record.created || ""),
    updated: String(record.updated || ""),
  } satisfies Product;

  return { ...product, imageUrl: productImageUrl(product) };
}


export async function getStoreName() {
  try {
    const pb = await createSuperuserPocketBase();
    const setting = await pb.collection("app_settings").getFirstListItem('key = "storeName"', {
      requestKey: null,
    });
    return String(setting.value || defaultStoreName);
  } catch {
    return defaultStoreName;
  }
}

export async function setStoreName(value: string) {
  const name = value.trim();
  if (!name) throw new Error("El nombre es obligatorio.");

  const pb = await createSuperuserPocketBase();
  try {
    const setting = await pb.collection("app_settings").getFirstListItem('key = "storeName"', {
      requestKey: null,
    });
    await pb.collection("app_settings").update(setting.id, { value: name });
  } catch {
    await pb.collection("app_settings").create({ key: "storeName", value: name });
  }
}
export async function listPublishedProducts() {
  const pb = createPocketBase();
  const records = await pb.collection("products").getFullList({
    filter: "published = true",
    sort: "-id",
    requestKey: null,
  });
  return records.map((record) => mapProduct(record as unknown as Record<string, unknown>));
}

export async function listAllProductsForSeller() {
  const pb = await createSuperuserPocketBase();
  const records = await pb.collection("products").getFullList({
    sort: "-id",
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

export type OrderItemSnapshot = {
  productName: string;
  unitPriceMinor: number;
  quantity: number;
  subtotalMinor: number;
};

export type Order = {
  id: string;
  email: string;
  publicToken: string;
  status: OrderStatus;
  totalMinor: number;
  currency: string;
  created: string;
  updated: string;
  items?: OrderItemSnapshot[];
};

function mapOrder(order: Record<string, unknown>, items: Record<string, unknown>[]) {
  return {
    id: String(order.id),
    email: String(order.email || ""),
    publicToken: String(order.publicToken || ""),
    status: (String(order.status || "pending") as OrderStatus),
    totalMinor: Number(order.totalMinor || 0),
    currency: String(order.currency || "ARS"),
    created: String(order.created || ""),
    updated: String(order.updated || ""),
    items: items.map((item) => ({
      productName: String(item.productName || ""),
      unitPriceMinor: Number(item.unitPriceMinor || 0),
      quantity: Number(item.quantity || 0),
      subtotalMinor: Number(item.subtotalMinor || 0),
    })),
  } satisfies Order;
}

export async function getOrderByToken(token: string) {
  const pb = await createSuperuserPocketBase();
  const order = await pb.collection("orders").getFirstListItem(`publicToken = "${token.replaceAll('"', "")}"`, {
    requestKey: null,
  });
  const items = await pb.collection("order_items").getFullList({
    filter: `order = "${order.id}"`,
    sort: "id",
    requestKey: null,
  });

  return mapOrder(order as unknown as Record<string, unknown>, items as unknown as Record<string, unknown>[]);
}

export async function listOrdersForSeller() {
  const pb = await createSuperuserPocketBase();
  const orders = await pb.collection("orders").getFullList({ sort: "-id", requestKey: null });
  return Promise.all(
    orders.map(async (order) => {
      const items = await pb.collection("order_items").getFullList({
        filter: `order = "${order.id}"`,
        sort: "id",
        requestKey: null,
      });
      return mapOrder(order as unknown as Record<string, unknown>, items as unknown as Record<string, unknown>[]);
    }),
  );
}










