import Link from "next/link";
import { redirect } from "next/navigation";
import { ConfirmSubmitButton } from "../../components/confirm-submit-button";
import { DeleteProductButton } from "../../components/delete-product-button";
import { ProductForm } from "../../components/product-form";
import { formatMoney } from "../../lib/money";
import { listAllProductsForSeller, listOrdersForSeller } from "../../lib/pocketbase";
import { getSellerSession } from "../../lib/session";
import { clearPaidOrdersThisMonth, deleteOrder, deleteProduct, logoutSeller, setOrderPaid, setProductPublished, setProductSold } from "../../lib/actions";

export const dynamic = "force-dynamic";

export default async function ProductsAdminPage() {
  const seller = await getSellerSession();
  if (!seller) redirect("/admin");
  const products = await listAllProductsForSeller();
  const orders = await listOrdersForSeller();
  const now = new Date();
  const paidOrdersThisMonth = orders.filter((order) => {
    const paidAt = order.updated ? new Date(order.updated) : null;
    return order.status === "approved" && paidAt && paidAt.getFullYear() === now.getFullYear() && paidAt.getMonth() === now.getMonth();
  });
  const soldProductsThisMonth = products.filter((product) => {
    const soldAt = product.updated ? new Date(product.updated) : null;
    return product.sold && soldAt && soldAt.getFullYear() === now.getFullYear() && soldAt.getMonth() === now.getMonth();
  });
  const paidOrdersTotalMinor = paidOrdersThisMonth.reduce((sum, order) => sum + order.totalMinor, 0);
  const soldProductsTotalMinor = soldProductsThisMonth.reduce((sum, product) => sum + product.priceMinor, 0);
  const monthlyTotalMinor = paidOrdersTotalMinor + soldProductsTotalMinor;
  const monthlyCurrency = paidOrdersThisMonth[0]?.currency || soldProductsThisMonth[0]?.currency || orders[0]?.currency || products[0]?.currency || "ARS";
  const monthlyLabel = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(now);

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-medium text-zinc-500">Panel vendedor</p>
            <h1 className="text-2xl font-bold text-zinc-950">Productos</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {seller.role === "admin" && <Link href="/admin/usuarios" className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium">Usuarios de ventas</Link>}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-500">Total vendido en {monthlyLabel}</p>
              <h2 className="text-2xl font-bold text-zinc-950">{formatMoney(monthlyTotalMinor, monthlyCurrency)}</h2>
              <p className="mt-1 text-sm text-zinc-600">{paidOrdersThisMonth.length} pedidos pagados · {soldProductsThisMonth.length} productos vendidos</p>
            </div>
            <form action={clearPaidOrdersThisMonth}>
              <input type="hidden" name="ids" value={paidOrdersThisMonth.map((order) => order.id).join(",")} />
              <ConfirmSubmitButton
                confirmMessage="Limpiar los pedidos pagados de este mes? Esta accion los elimina del panel."
                pendingText="Limpiando..."
                className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                Limpiar
              </ConfirmSubmitButton>
            </form>
          </div>
        </section>

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
                  <p className="mt-1 text-sm text-zinc-500">{product.published ? "Publicado" : "Oculto"}{product.sold ? " · Vendido" : ""}</p>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-zinc-950 underline">Editar publicacion</summary>
                    <div className="mt-3">
                      <ProductForm product={product} />
                    </div>
                  </details>
                </div>
                <div className="flex flex-col gap-2 self-center">
                  <form action={setProductPublished}>
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="published" value={product.published ? "false" : "true"} />
                    <button className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
                      {product.published ? "Despublicar" : "Publicar"}
                    </button>
                  </form>
                  <form action={setProductSold}>
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="sold" value={product.sold ? "false" : "true"} />
                    <button className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
                      {product.sold ? "Disponible" : "Marcar vendido"}
                    </button>
                  </form>
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={product.id} />
                    <DeleteProductButton productName={product.name} />
                  </form>
                </div>
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
                    <p className={order.status === "approved" ? "text-sm font-medium text-emerald-700" : "text-sm text-zinc-500"}>
                      {order.status === "approved" ? "Pagado" : "Pendiente"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link href={`/pedido/${order.publicToken}`} className="inline-flex text-sm font-medium text-zinc-950 underline">
                    Ver estado
                  </Link>
                  <form action={setOrderPaid}>
                    <input type="hidden" name="id" value={order.id} />
                    <input type="hidden" name="paid" value={order.status === "approved" ? "false" : "true"} />
                    <button className="rounded-md border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
                      {order.status === "approved" ? "Marcar pendiente" : "Pagado"}
                    </button>
                  </form>
                  <form action={deleteOrder}>
                    <input type="hidden" name="id" value={order.id} />
                    <ConfirmSubmitButton
                      confirmMessage={`Limpiar el pedido de ${order.email}? Esta accion lo elimina del panel.`}
                      pendingText="Limpiando..."
                      className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Limpiar pedido
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </section>
        </div>
      </div>
    </main>
  );
}


