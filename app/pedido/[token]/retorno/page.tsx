import { redirect } from "next/navigation";
import { reconcileMercadoPagoPayment } from "../../../lib/mercado-pago";

export const dynamic = "force-dynamic";

export default async function MercadoPagoReturnPage({ params, searchParams }: PageProps<"/pedido/[token]/retorno">) {
  const { token } = await params;
  const query = await searchParams;
  const paymentId = typeof query.payment_id === "string" ? query.payment_id : "";

  if (paymentId) {
    await reconcileMercadoPagoPayment(paymentId).catch(() => null);
  }

  redirect(`/pedido/${token}`);
}
