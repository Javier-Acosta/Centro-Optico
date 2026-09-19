import { NextRequest, NextResponse } from "next/server";
import { reconcileMercadoPagoPayment, verifyMercadoPagoSignature } from "../../../lib/mercado-pago";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const dataId = String(payload?.data?.id || request.nextUrl.searchParams.get("data.id") || request.nextUrl.searchParams.get("id") || "");

  const valid = verifyMercadoPagoSignature({
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId,
  });

  if (!valid) return NextResponse.json({ ok: false }, { status: 401 });

  if (payload?.type === "payment" && dataId) {
    await reconcileMercadoPagoPayment(dataId);
  }

  return NextResponse.json({ ok: true });
}
