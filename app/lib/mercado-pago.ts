import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { createSuperuserPocketBase, type OrderItemSnapshot } from "./pocketbase";

const provider = "mercadopago";

export function mercadoPagoReady() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  return Boolean(token?.startsWith("TEST-") && appUrl && webhookSecret);
}

function accessToken() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) throw new Error("Falta MERCADO_PAGO_ACCESS_TOKEN.");
  if (!token.startsWith("TEST-")) throw new Error("Mercado Pago solo esta habilitado con credenciales de prueba TEST-.");
  return token;
}

function appUrl() {
  const value = process.env.NEXT_PUBLIC_APP_URL;
  if (!value) throw new Error("Falta NEXT_PUBLIC_APP_URL.");
  return value.replace(/\/$/, "");
}

function webhookSecret() {
  const value = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!value) throw new Error("Falta MERCADO_PAGO_WEBHOOK_SECRET.");
  return value;
}

function client() {
  return new MercadoPagoConfig({ accessToken: accessToken(), options: { timeout: 10000 } });
}

function toMajorAmount(minor: number) {
  return Number((minor / 100).toFixed(2));
}

function paymentStatus(status?: string) {
  if (status === "approved") return "approved";
  if (status === "rejected" || status === "cancelled" || status === "refunded" || status === "charged_back") return "rejected";
  return "pending";
}

async function upsertPaymentAttempt(orderId: string, externalReference: string, status: "pending" | "approved" | "rejected", providerPaymentId?: string) {
  const pb = await createSuperuserPocketBase();
  try {
    const existing = await pb.collection("payment_attempts").getFirstListItem(`externalReference = "${externalReference.replaceAll('"', '')}"`, { requestKey: null });
    await pb.collection("payment_attempts").update(existing.id, {
      status,
      providerPaymentId: providerPaymentId || existing.providerPaymentId || "",
    });
    return existing;
  } catch (error) {
    if (typeof error === "object" && error && "status" in error && error.status !== 404) throw error;
  }

  return pb.collection("payment_attempts").create({
    order: orderId,
    provider,
    externalReference,
    providerPaymentId: providerPaymentId || "",
    status,
  });
}

export async function createCheckoutPreference(order: {
  id: string;
  email: string;
  publicToken: string;
  totalMinor: number;
  currency: string;
  items: OrderItemSnapshot[];
}) {
  if (!mercadoPagoReady()) return null;

  const baseUrl = appUrl();
  const externalReference = order.id;
  await upsertPaymentAttempt(order.id, externalReference, "pending");

  const preference = new Preference(client());
  const response = await preference.create({
    body: {
      external_reference: externalReference,
      notification_url: `${baseUrl}/api/mercado-pago/webhook`,
      back_urls: {
        success: `${baseUrl}/pedido/${order.publicToken}/retorno`,
        pending: `${baseUrl}/pedido/${order.publicToken}/retorno`,
        failure: `${baseUrl}/pedido/${order.publicToken}/retorno`,
      },
      auto_return: "approved",
      payer: { email: order.email },
      items: order.items.map((item, index) => ({
        id: `${order.id}-${index}`,
        title: item.productName,
        quantity: item.quantity,
        currency_id: order.currency,
        unit_price: toMajorAmount(item.unitPriceMinor),
      })),
      metadata: { order_id: order.id, public_token: order.publicToken },
    },
    requestOptions: { idempotencyKey: `order-${order.id}` },
  });

  if (response.id) await upsertPaymentAttempt(order.id, externalReference, "pending", response.id);
  return response.sandbox_init_point || response.init_point || null;
}

export function verifyMercadoPagoSignature(input: { xSignature: string | null; xRequestId: string | null; dataId: string | null }) {
  const signature = input.xSignature;
  const requestId = input.xRequestId;
  const dataId = input.dataId;
  if (!signature || !requestId || !dataId) return false;

  const parts = Object.fromEntries(
    signature.split(",").map((part) => {
      const [key, value] = part.trim().split("=");
      return [key, value];
    }),
  );

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", webhookSecret()).update(manifest).digest("hex");
  const left = Buffer.from(expected);
  const right = Buffer.from(v1);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function reconcileMercadoPagoPayment(paymentId: string) {
  if (!mercadoPagoReady()) throw new Error("Mercado Pago no esta configurado en modo prueba.");
  if (!/^\d+$/.test(paymentId)) throw new Error("Pago invalido.");

  const payment = await new Payment(client()).get({ id: paymentId });
  const externalReference = String(payment.external_reference || "");
  if (!externalReference) throw new Error("El pago no tiene referencia externa.");

  const pb = await createSuperuserPocketBase();
  const order = await pb.collection("orders").getOne(externalReference, { requestKey: null });
  const expectedAmount = Number(order.totalMinor || 0) / 100;
  const expectedCurrency = String(order.currency || "ARS");
  const amountMatches = Math.abs(Number(payment.transaction_amount || 0) - expectedAmount) < 0.01;
  const currencyMatches = String(payment.currency_id || "") === expectedCurrency;

  if (!amountMatches || !currencyMatches) {
    await upsertPaymentAttempt(order.id, externalReference, "rejected", String(payment.id || paymentId));
    return { ok: false, status: "rejected" as const };
  }

  const status = paymentStatus(payment.status);
  await upsertPaymentAttempt(order.id, externalReference, status, String(payment.id || paymentId));

  const currentStatus = String(order.status || "pending");
  if (currentStatus !== "approved") {
    await pb.collection("orders").update(order.id, { status });
  }

  return { ok: true, status };
}
