import Link from "next/link";
import { ProductCatalog } from "./components/product-catalog";
import { getStoreName, listPublishedProducts } from "./lib/pocketbase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, storeName] = await Promise.all([
    listPublishedProducts().catch(() => []),
    getStoreName(),
  ]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#faf7f0]">
      <header className="border-b border-[#eadfcd] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-[var(--font-playfair)] text-3xl font-bold tracking-tight text-[#b88a44] sm:text-4xl">{storeName}</p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-[#181412] sm:text-2xl">Productos disponibles</h1>
          </div>
          <Link href="/admin" className="self-start rounded-md border border-[#d8c6aa] bg-[#faf7f0] px-3 py-2 text-sm font-medium text-[#181412] hover:bg-[#f2eadc] sm:self-auto">
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



