import Link from "next/link";
import { ProductCatalog } from "./components/product-catalog";
import { listPublishedProducts } from "./lib/pocketbase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await listPublishedProducts().catch(() => []);

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-medium text-zinc-500">Tienda Cata</p>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Productos disponibles</h1>
          </div>
          <Link href="/admin" className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
            Vendedor
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <ProductCatalog products={products} />
      </div>
    </main>
  );
}
