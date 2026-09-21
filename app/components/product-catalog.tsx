'use client';

import { useActionState, useEffect, useMemo, useState } from "react";
import type { Product } from "../lib/pocketbase";
import { createOrder, type ActionState } from "../lib/actions";
import { formatMoney } from "../lib/money";

type CartLine = { id: string; quantity: number };

const storageKey = "tienda-cata-cart";
const initialOrderState: ActionState = {};

export function ProductCatalog({ products }: { products: Product[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartLine[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart]);

  const cartProducts = useMemo(() => {
    return cart
      .map((line) => {
        const product = products.find((item) => item.id === line.id);
        if (!product) return null;
        return { ...product, quantity: line.quantity, subtotal: product.priceMinor * line.quantity };
      })
      .filter(Boolean) as Array<Product & { quantity: number; subtotal: number }>;
  }, [cart, products]);

  const total = cartProducts.reduce((sum, item) => sum + item.subtotal, 0);
  const [orderState, orderAction, orderPending] = useActionState(createOrder, initialOrderState);

  function add(product: Product) {
    if (product.sold) return;
    setCart((current) => {
      const existing = current.find((line) => line.id === product.id);
      if (existing) {
        return current.map((line) => (line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line));
      }
      return [...current, { id: product.id, quantity: 1 }];
    });
  }

  function update(id: string, quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 1) return;
    setCart((current) => current.map((line) => (line.id === id ? { ...line, quantity } : line)));
  }

  function remove(id: string) {
    setCart((current) => current.filter((line) => line.id !== id));
  }

  return (
    <>
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section aria-label="Productos" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.length === 0 ? (
          <div className="sm:col-span-2 xl:col-span-3 rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-600">
            Todavia no hay productos publicados.
          </div>
        ) : null}

        {products.map((product) => (
          <article key={product.id} className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <button type="button" onClick={() => setSelectedProduct(product)} className="relative block w-full text-left" aria-label={`Ver ${product.name} mas grande`}>
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt={product.name} className="aspect-square w-full bg-zinc-50 object-contain p-3 transition hover:scale-[1.02]" />
              ) : (
                <div className="aspect-square bg-zinc-100" />
              )}
              {product.sold ? (
                <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
                  Vendido
                </span>
              ) : null}
              <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-zinc-800 shadow-sm">Ver mas</span>
            </button>
            <div className="space-y-3 p-4">
              <div>
                <button type="button" onClick={() => setSelectedProduct(product)} className="text-left text-lg font-semibold text-zinc-950 hover:underline">{product.name}</button>
                {product.description ? <p className="mt-1 line-clamp-3 text-sm text-zinc-600">{product.description}</p> : null}
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-lg font-bold text-zinc-950">{formatMoney(product.priceMinor, product.currency)}</span>
                <button
                  type="button"
                  onClick={() => add(product)}
                  className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                  disabled={product.sold}
                >
                  {product.sold ? "Vendido" : "Agregar"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-4 shadow-sm lg:sticky lg:top-6">
        <h2 className="text-lg font-semibold text-zinc-950">Carrito</h2>
        {cartProducts.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">El carrito esta vacio.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {cartProducts.map((item) => (
              <div key={item.id} className="grid gap-2 border-b border-zinc-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-zinc-950">{item.name}</p>
                    <p className="text-sm text-zinc-600">{formatMoney(item.priceMinor, item.currency)} c/u</p>
                  </div>
                  <button type="button" onClick={() => remove(item.id)} className="text-sm text-zinc-500 hover:text-zinc-950">
                    Quitar
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm text-zinc-600">
                    Cantidad
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(event) => update(item.id, Number(event.target.value))}
                      className="ml-2 w-20 rounded-md border border-zinc-300 px-2 py-1 text-zinc-950"
                    />
                  </label>
                  <span className="font-semibold text-zinc-950">{formatMoney(item.subtotal, item.currency)}</span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-zinc-200 pt-4 text-lg font-bold text-zinc-950">
              <span>Total</span>
              <span>{formatMoney(total, cartProducts[0]?.currency || "ARS")}</span>
            </div>
            <form action={orderAction} className="space-y-3">
              <input type="hidden" name="items" value={JSON.stringify(cart)} />
              <label className="grid gap-1 text-sm font-medium text-zinc-800">
                Email de contacto
                <input name="email" type="email" required className="rounded-md border border-zinc-300 px-3 py-2" />
              </label>
              {orderState.message ? <p className="text-sm text-red-700">{orderState.message}</p> : null}
              <button
                type="submit"
                className="w-full rounded-md bg-zinc-950 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
                disabled={orderPending || cart.length === 0}
              >
                {orderPending ? "Preparando WhatsApp..." : "Enviar pedido por WhatsApp"}
              </button>
              <p className="text-xs text-zinc-500">Se creara el pedido pendiente y se abrira WhatsApp con el resumen para coordinar pago y entrega.</p>
            </form>
          </div>
        )}
      </aside>
    </div>

    {selectedProduct ? (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="product-modal-title" onClick={() => setSelectedProduct(null)}>
        <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="relative">
            {selectedProduct.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="max-h-[70vh] w-full bg-zinc-100 object-contain p-4" />
            ) : (
              <div className="h-80 bg-zinc-100" />
            )}
            {selectedProduct.sold ? (
              <span className="absolute left-4 top-4 rounded-full bg-red-600 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-sm">
                Vendido
              </span>
            ) : null}
            <button type="button" onClick={() => setSelectedProduct(null)} className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-white">
              Cerrar
            </button>
          </div>
          <div className="space-y-4 p-5">
            <div>
              <p className="text-sm font-medium text-zinc-500">Producto</p>
              <h2 id="product-modal-title" className="text-2xl font-bold text-zinc-950">{selectedProduct.name}</h2>
              {selectedProduct.description ? <p className="mt-2 whitespace-pre-line text-sm text-zinc-600">{selectedProduct.description}</p> : null}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">
              <span className="text-2xl font-bold text-zinc-950">{formatMoney(selectedProduct.priceMinor, selectedProduct.currency)}</span>
              <button
                type="button"
                onClick={() => { add(selectedProduct); setSelectedProduct(null); }}
                disabled={selectedProduct.sold}
                className="rounded-md bg-zinc-950 px-4 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {selectedProduct.sold ? "Vendido" : "Agregar al carrito"}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}





