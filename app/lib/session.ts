import "server-only";
import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const cookieName = "tienda_cata_seller";
const maxAge = 60 * 60 * 8;

function secret() {
  const value = process.env.SELLER_SESSION_SECRET || process.env.POCKETBASE_SUPERUSER_PASSWORD;
  if (!value) throw new Error("Falta SELLER_SESSION_SECRET o POCKETBASE_SUPERUSER_PASSWORD.");
  return value;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function verify(value: string, signature: string) {
  const expected = sign(value);
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function createSellerSession() {
  const token = randomBytes(24).toString("base64url");
  const expires = Date.now() + maxAge * 1000;
  const value = `${token}.${expires}`;
  const cookieStore = await cookies();

  cookieStore.set(cookieName, `${value}.${sign(value)}`, {
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
  const cookieStore = await cookies();
  const raw = cookieStore.get(cookieName)?.value;
  if (!raw) return false;

  const parts = raw.split(".");
  if (parts.length !== 3) return false;

  const [token, expires, signature] = parts;
  if (!token || !expires || !signature) return false;
  if (Number(expires) < Date.now()) return false;

  return verify(`${token}.${expires}`, signature);
}
