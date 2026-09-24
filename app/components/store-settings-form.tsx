'use client';

import { useActionState } from "react";
import { updateStoreSettings, type ActionState } from "../lib/actions";

const initialState: ActionState = {};

export function StoreSettingsForm({ storeName }: { storeName: string }) {
  const [state, action, pending] = useActionState(updateStoreSettings, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-zinc-950">Configuracion</h2>
        <p className="text-sm text-zinc-600">Nombre visible de la tienda.</p>
      </div>
      <label className="grid gap-1 text-sm font-medium text-zinc-800">
        Nombre de la aplicacion
        <input name="storeName" required maxLength={80} defaultValue={storeName} className="rounded-md border border-zinc-300 px-3 py-2" />
      </label>
      {state.message ? <p className={state.ok ? "text-sm text-emerald-700" : "text-sm text-red-700"}>{state.message}</p> : null}
      <button disabled={pending} className="rounded-md bg-zinc-950 px-4 py-3 font-medium text-white disabled:bg-zinc-400">
        {pending ? "Guardando..." : "Guardar nombre"}
      </button>
    </form>
  );
}
