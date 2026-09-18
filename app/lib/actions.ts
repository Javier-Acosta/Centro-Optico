'use server';

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSellerSession, clearSellerSession, isSellerAuthenticated } from "./session";
import { createSuperuserPocketBase, getPublishedProductsByIds } from "./pocketbase";
import { parsePriceToMinor } from "./money";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 5 * 1024 * 1024;

export type ActionState = {
  ok?: boolean;
  message?: string;
};

async function verifySameOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const host = headerStore.get("host");
  if (!origin || !host) return;
  const originHost = new URL(origin).host;
  if (originHost !== host) throw new Error("Origen no permitido.");
}

export async function loginSeller(_state: ActionState, formData: FormData): Promise<ActionState> {
  await verifySameOrigin();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) return { message: "Ingresa email y contrasena." };

  try {
    const expectedEmail = process.env.POCKETBASE_SUPERUSER_EMAIL;
    if (expectedEmail && email.toLowerCase() !== expectedEmail.toLowerCase()) {
      return { message: "Los datos no coinciden con el vendedor configurado." };
    }

    const pb = await createSuperuserPocketBase();
    if (!pb.authStore.isValid) return { message: "No se pudo validar el vendedor." };

    await createSellerSession();
  } catch {
    return { message: "No se pudo iniciar sesion. Revisa los datos." };
  }

  redirect("/admin/productos");
}

export async function logoutSeller() {
  await verifySameOrigin();
  await clearSellerSession();
  redirect("/admin");
}

async function validImage(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return "Subi una imagen del producto.";
  if (!allowedImageTypes.has(file.type)) return "La imagen debe ser JPEG, PNG o WebP.";
  if (file.size > maxImageSize) return "La imagen no puede superar 5 MiB.";

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isWebp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  if (!isJpeg && !isPng && !isWebp) return "El archivo no parece una imagen valida.";

  return null;
}

export async function createProduct(_state: ActionState, formData: FormData): Promise<ActionState> {
  await verifySameOrigin();
  if (!(await isSellerAuthenticated())) return { message: "Sesion vencida. Volve a ingresar." };

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceMinor = parsePriceToMinor(formData.get("price"));
  const image = formData.get("image");
  const published = formData.get("published") === "on";
  const imageError = await validImage(image);

  if (!name) return { message: "El nombre es obligatorio." };
  if (!priceMinor) return { message: "Ingresa un precio positivo." };
  if (imageError) return { message: imageError };

  try {
    const pb = await createSuperuserPocketBase();
    const payload = new FormData();
    payload.set("name", name);
    payload.set("description", description);
    payload.set("priceMinor", String(priceMinor));
    payload.set("currency", "ARS");
    payload.set("published", String(published));
    payload.set("image", image as File);

    await pb.collection("products").create(payload);
  } catch {
    return { message: "No se pudo guardar el producto. Intenta nuevamente." };
  }

  revalidatePath("/");
  revalidatePath("/admin/productos");
  return { ok: true, message: "Producto guardado." };
}

export async function setProductPublished(formData: FormData) {
  await verifySameOrigin();
  if (!(await isSellerAuthenticated())) redirect("/admin");

  const id = String(formData.get("id") || "");
  const published = formData.get("published") === "true";
  if (!id) return;

  const pb = await createSuperuserPocketBase();
  await pb.collection("products").update(id, { published });
  revalidatePath("/");
  revalidatePath("/admin/productos");
}


type CartInput = { id: string; quantity: number };

function parseCartItems(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") return [];
  const parsed = JSON.parse(value) as CartInput[];
  return parsed
    .map((item) => ({ id: String(item.id || ""), quantity: Number(item.quantity) }))
    .filter((item) => /^[A-Za-z0-9_-]+$/.test(item.id) && Number.isInteger(item.quantity) && item.quantity > 0);
}

export async function createOrder(_state: ActionState, formData: FormData): Promise<ActionState> {
  await verifySameOrigin();

  const email = String(formData.get("email") || "").trim();
  const items = parseCartItems(formData.get("items"));

  if (!/^\S+@\S+\.\S+$/.test(email)) return { message: "Ingresa un email valido." };
  if (items.length === 0) return { message: "El carrito esta vacio." };

  const products = await getPublishedProductsByIds([...new Set(items.map((item) => item.id))]);
  if (products.length !== new Set(items.map((item) => item.id)).size) {
    return { message: "Hay productos que ya no estan publicados. Revisa el carrito." };
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const snapshots = items.map((item) => {
    const product = productMap.get(item.id);
    if (!product) throw new Error("Producto no encontrado.");
    return {
      product,
      quantity: item.quantity,
      subtotalMinor: product.priceMinor * item.quantity,
    };
  });
  const totalMinor = snapshots.reduce((sum, item) => sum + item.subtotalMinor, 0);
  const currency = snapshots[0]?.product.currency || "ARS";
  const publicToken = randomBytes(32).toString("base64url");

  const pb = await createSuperuserPocketBase();
  const order = await pb.collection("orders").create({
    email,
    publicToken,
    status: "pending",
    totalMinor,
    currency,
  });

  for (const item of snapshots) {
    await pb.collection("order_items").create({
      order: order.id,
      product: item.product.id,
      productName: item.product.name,
      unitPriceMinor: item.product.priceMinor,
      quantity: item.quantity,
      subtotalMinor: item.subtotalMinor,
    });
  }

  revalidatePath("/admin/productos");
  redirect(`/pedido/${publicToken}`);
}
