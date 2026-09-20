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

export async function isSellerAuthenticated() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return false;

  try {
    const pb = createPocketBase();
    pb.authStore.save(token);
    if (!pb.authStore.isValid) return false;
    // PocketBase verifies the signature and checks that the account still exists.
    const auth = await pb.collection("sellers").authRefresh();
    return auth.record.collectionName === "sellers";
  } catch {
    return false;
  }
}
