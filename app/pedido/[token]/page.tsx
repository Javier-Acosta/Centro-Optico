import Link from "next/link";
import { notFound } from "next/navigation";
import { formatMoney } from "../../lib/money";
import { getOrderByToken } from "../../lib/pocketbase";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: PageProps<"/pedido/[token]">) {
  const { token } = await params;
  const order = await getOrderByToken(token).catch(() => null);
  if (!order) notFound();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <section className="mx-auto max-w-xl rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-zinc-500">Pedido</p>
        <h1 className="mt-1 text-2xl font-bold text-zinc-950">Estado: {order.status === "pending" ? "Pendiente" : order.status}</h1>
        <p className="mt-2 text-sm text-zinc-600">Te avisaremos a {order.email} cuando se confirme el pago.</p>

        <div className="mt-6 space-y-3">
          {order.items?.map((item) => (
            <div key={`${item.productName}-${item.quantity}`} className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-3 last:border-0">
              <div>
                <p className="font-medium text-zinc-950">{item.productName}</p>
                <p className="text-sm text-zinc-600">{item.quantity} x {formatMoney(item.unitPriceMinor, order.currency)}</p>
              </div>
              <p className="font-semibold text-zinc-950">{formatMoney(item.subtotalMinor, order.currency)}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-zinc-200 pt-4 text-lg font-bold text-zinc-950">
          <span>Total</span>
          <span>{formatMoney(order.totalMinor, order.currency)}</span>
        </div>

        <Link href="/" className="mt-6 inline-flex rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
          Volver a la tienda
        </Link>
      </section>
    </main>
  );
}
