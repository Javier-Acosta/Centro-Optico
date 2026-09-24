'use client';

import { useActionState } from "react";
import { createProduct, updateProduct, type ActionState } from "../lib/actions";
import type { Product } from "../lib/pocketbase";

const initialState: ActionState = {};

function formatPriceInput(priceMinor: number) {
  return priceMinor > 0 ? String(priceMinor / 100) : "";
}

export function ProductForm({ product }: { product?: Product }) {
  const isEditing = Boolean(product);
  const [state, action, pending] = useActionState(isEditing ? updateProduct : createProduct, initialState);

  return (
    <form action={action} className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-zinc-950">{isEditing ? "Editar publicacion" : "Nuevo producto"}</h2>
        <p className="text-sm text-zinc-600">{isEditing ? "Actualiza los datos visibles en la tienda." : "Cargalo desde el telefono eligiendo una foto de la galeria o usando la camara."}</p>
      </div>

      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <label className="grid gap-1 text-sm font-medium text-zinc-800">
        Foto {isEditing ? <span className="font-normal text-zinc-500">Opcional</span> : null}
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*,.heic,.heif"
          required={!isEditing}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
        />
      </label>

      <label className="grid gap-1 text-sm font-medium text-zinc-800">
        Nombre
        <input name="name" required maxLength={120} defaultValue={product?.name || ""} className="rounded-md border border-zinc-300 px-3 py-2" />
      </label>

      <label className="grid gap-1 text-sm font-medium text-zinc-800">
        Descripcion
        <textarea name="description" rows={3} defaultValue={product?.description || ""} className="rounded-md border border-zinc-300 px-3 py-2" />
      </label>

      <label className="grid gap-1 text-sm font-medium text-zinc-800">
        Precio
        <input name="price" required inputMode="decimal" placeholder="2500" defaultValue={product ? formatPriceInput(product.priceMinor) : ""} className="rounded-md border border-zinc-300 px-3 py-2" />
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-zinc-800">
        <input name="published" type="checkbox" defaultChecked={product?.published ?? true} className="size-4" />
        Publicar ahora
      </label>

      {state.message ? (
        <p className={state.ok ? "text-sm text-emerald-700" : "text-sm text-red-700"}>{state.message}</p>
      ) : null}

      <button disabled={pending} className="rounded-md bg-zinc-950 px-4 py-3 font-medium text-white disabled:bg-zinc-400">
        {pending ? "Guardando..." : isEditing ? "Guardar cambios" : "Guardar producto"}
      </button>
    </form>
  );
}

