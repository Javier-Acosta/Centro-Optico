'use client';

import { useActionState } from "react";
import { createProduct, type ActionState } from "../lib/actions";

const initialState: ActionState = {};

export function ProductForm() {
  const [state, action, pending] = useActionState(createProduct, initialState);

  return (
    <form action={action} className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-zinc-950">Nuevo producto</h2>
        <p className="text-sm text-zinc-600">Cargalo desde el telefono con foto, precio y publicacion.</p>
      </div>

      <label className="grid gap-1 text-sm font-medium text-zinc-800">
        Foto
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          required
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
        />
      </label>

      <label className="grid gap-1 text-sm font-medium text-zinc-800">
        Nombre
        <input name="name" required maxLength={120} className="rounded-md border border-zinc-300 px-3 py-2" />
      </label>

      <label className="grid gap-1 text-sm font-medium text-zinc-800">
        Descripcion
        <textarea name="description" rows={3} className="rounded-md border border-zinc-300 px-3 py-2" />
      </label>

      <label className="grid gap-1 text-sm font-medium text-zinc-800">
        Precio
        <input name="price" required inputMode="decimal" placeholder="2500" className="rounded-md border border-zinc-300 px-3 py-2" />
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-zinc-800">
        <input name="published" type="checkbox" defaultChecked className="size-4" />
        Publicar ahora
      </label>

      {state.message ? (
        <p className={state.ok ? "text-sm text-emerald-700" : "text-sm text-red-700"}>{state.message}</p>
      ) : null}

      <button disabled={pending} className="rounded-md bg-zinc-950 px-4 py-3 font-medium text-white disabled:bg-zinc-400">
        {pending ? "Guardando..." : "Guardar producto"}
      </button>
    </form>
  );
}
