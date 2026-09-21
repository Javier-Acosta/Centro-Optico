import "server-only";
import { cookies } from "next/headers";
import { createPocketBase } from "./pocketbase";

const cookieName = "tienda_cata_seller";
const maxAge = 60 * 60 * 8;

export async function createSellerSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function clearSellerSession() {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, "", { path: "/", maxAge: 0 });
}

export async function getSellerSession() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;

  try {
    const pb = createPocketBase();
    pb.authStore.save(token);
    if (!pb.authStore.isValid) return null;
    // PocketBase verifies the signature and checks that the account still exists.
    const auth = await pb.collection("sellers").authRefresh();
    if (auth.record.collectionName !== "sellers" || auth.record.disabled === true) return null;
    if (!["admin", "assistant"].includes(auth.record.role)) return null;
    return { id: auth.record.id, role: auth.record.role as "admin" | "assistant" };
  } catch {
    return null;
  }
}

export async function isSellerAuthenticated() {
  return (await getSellerSession()) !== null;
}
