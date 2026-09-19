import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByToken } from "../../../lib/pocketbase";
import { buildWhatsAppOrderUrl } from "../../../lib/whatsapp";
import { WhatsAppRedirect } from "./whatsapp-redirect";

export const dynamic = "force-dynamic";

export default async function OrderWhatsAppPage({ params }: PageProps<"/pedido/[token]/whatsapp">) {
  const { token } = await params;
  const order = await getOrderByToken(token).catch(() => null);
  if (!order) notFound();

  const whatsappUrl = buildWhatsAppOrderUrl({
    publicToken: order.publicToken,
    email: order.email,
    totalMinor: order.totalMinor,
    currency: order.currency,
    items: order.items || [],
  });

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <section className="mx-auto max-w-xl rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-zinc-500">Pedido creado</p>
        <h1 className="mt-1 text-2xl font-bold text-zinc-950">Abrimos WhatsApp para enviarlo</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Si WhatsApp no se abre automaticamente, usa el boton. El pedido ya quedo guardado como pendiente.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <WhatsAppRedirect url={whatsappUrl} />
          <Link href={`/pedido/${order.publicToken}`} className="inline-flex rounded-md border border-zinc-300 px-4 py-3 font-medium text-zinc-700 hover:bg-zinc-100">
            Ver pedido
          </Link>
        </div>
      </section>
    </main>
  );
}
