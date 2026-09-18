import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductForm } from "../../components/product-form";
import { formatMoney } from "../../lib/money";
import { listAllProductsForSeller, listOrdersForSeller } from "../../lib/pocketbase";
import { isSellerAuthenticated } from "../../lib/session";
import { logoutSeller, setProductPublished } from "../../lib/actions";

export const dynamic = "force-dynamic";

export default async function ProductsAdminPage() {
  if (!(await isSellerAuthenticated())) redirect("/admin");
  const products = await listAllProductsForSeller();
  const orders = await listOrdersForSeller();

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-medium text-zinc-500">Panel vendedor</p>
            <h1 className="text-2xl font-bold text-zinc-950">Productos</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
              Ver tienda
            </Link>
            <form action={logoutSeller}>
              <button className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white">Salir</button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[380px_1fr]">
        <ProductForm />

        <div className="grid gap-6">
        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Cargados</h2>
          <div className="mt-4 grid gap-3">
            {products.length === 0 ? <p className="text-sm text-zinc-600">Todavia no cargaste productos.</p> : null}
            {products.map((product) => (
              <article key={product.id} className="grid gap-3 rounded-lg border border-zinc-200 p-3 sm:grid-cols-[96px_1fr_auto]">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt={product.name} className="size-24 rounded-md object-cover" />
                ) : (
                  <div className="size-24 rounded-md bg-zinc-100" />
                )}
                <div>
                  <h3 className="font-semibold text-zinc-950">{product.name}</h3>
                  <p className="text-sm text-zinc-600">{formatMoney(product.priceMinor, product.currency)}</p>
                  <p className="mt-1 text-sm text-zinc-500">{product.published ? "Publicado" : "Oculto"}</p>
                </div>
                <form action={setProductPublished} className="self-center">
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="published" value={product.published ? "false" : "true"} />
                  <button className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
                    {product.published ? "Despublicar" : "Publicar"}
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Pedidos</h2>
          <div className="mt-4 grid gap-3">
            {orders.length === 0 ? <p className="text-sm text-zinc-600">Todavia no hay pedidos.</p> : null}
            {orders.map((order) => (
              <article key={order.id} className="rounded-lg border border-zinc-200 p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-zinc-950">{order.email}</p>
                    <p className="text-sm text-zinc-600">{order.items?.length || 0} articulos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-zinc-950">{formatMoney(order.totalMinor, order.currency)}</p>
                    <p className="text-sm text-zinc-500">{order.status}</p>
                  </div>
                </div>
                <Link href={`/pedido/${order.publicToken}`} className="mt-3 inline-flex text-sm font-medium text-zinc-950 underline">
                  Ver estado
                </Link>
              </article>
            ))}
          </div>
        </section>
        </div>
      </div>
    </main>
  );
}

