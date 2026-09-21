import Link from "next/link";
import { redirect } from "next/navigation";
import { getSellerSession } from "../../lib/session";
import { createSuperuserPocketBase } from "../../lib/pocketbase";
import { SellerForm } from "../../components/seller-form";

export const dynamic = "force-dynamic";

export default async function SellersPage() {
  const session = await getSellerSession();
  if (!session) redirect("/admin");
  if (session.role !== "admin") redirect("/admin/productos");
  const pb = await createSuperuserPocketBase();
  const sellers = await pb.collection("sellers").getFullList({
    filter: 'role = "assistant"', sort: "name", fields: "id,name,email,disabled", requestKey: null,
  });
  return <main className="min-h-screen bg-zinc-50 px-4 py-6">
    <div className="mx-auto max-w-5xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Usuarios de ventas</h1>
        <Link href="/admin/productos" className="rounded-md border border-zinc-300 px-3 py-2 text-sm">Volver al panel</Link>
      </header>
      <p className="mb-6 text-zinc-600">Los ayudantes pueden trabajar con ventas y catálogo. Solo el administrador puede gestionar usuarios.</p>
      <div className="grid items-start gap-6 md:grid-cols-[320px_1fr]">
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold">Nuevo ayudante</h2>
          <SellerForm operation="create" />
        </section>
        <section className="grid gap-4" aria-label="Ayudantes">
          {sellers.length === 0 && <p className="rounded-lg border border-zinc-200 bg-white p-5 text-zinc-600">Todavía no creaste ayudantes.</p>}
          {sellers.map(seller => <article key={seller.id} className="rounded-lg border border-zinc-200 bg-white p-5">
            <h2 className="font-semibold">{String(seller.name)}</h2>
            <p className="break-all text-sm text-zinc-600">{String(seller.email)}</p>
            <p className="my-3 text-sm">{seller.disabled ? "Acceso desactivado" : "Acceso activo"} · Ventas y catálogo</p>
            <SellerForm id={seller.id} operation="status" disabled={Boolean(seller.disabled)} />
            <details className="mt-4">
              <summary className="mb-3 cursor-pointer text-sm font-medium">Cambiar contraseña</summary>
              <SellerForm id={seller.id} operation="password" />
            </details>
          </article>)}
        </section>
      </div>
    </div>
  </main>;
}
