"use client";

import { useActionState } from "react";
import { manageSeller } from "../lib/seller-actions";
import type { ActionState } from "../lib/actions";

const initial: ActionState = {};
const inputClass = "w-full rounded-md border border-zinc-300 px-3 py-2";

export function SellerForm({ id, operation, disabled = false }: { id?: string; operation: "create" | "password" | "status"; disabled?: boolean }) {
  const [state, action, pending] = useActionState(manageSeller, initial);
  const op = operation === "status" ? (disabled ? "enable" : "disable") : operation;
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="operation" value={op} />
      {id && <input type="hidden" name="id" value={id} />}
      {operation === "create" && <>
        <label className="grid gap-1 text-sm font-medium">Nombre<input name="name" required maxLength={120} className={inputClass} /></label>
        <label className="grid gap-1 text-sm font-medium">Email<input name="email" type="email" required autoComplete="off" className={inputClass} /></label>
      </>}
      {operation !== "status" && <label className="grid gap-1 text-sm font-medium">{operation === "create" ? "Contraseña" : "Nueva contraseña"}
        <input name="password" type="password" required minLength={12} maxLength={72} autoComplete="new-password" className={inputClass} />
        <span className="text-xs font-normal text-zinc-500">Entre 12 y 72 caracteres.</span>
      </label>}
      {state.message && <p role="status" className={`text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}>{state.message}</p>}
      <button disabled={pending} className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
        {pending ? "Guardando..." : operation === "create" ? "Crear ayudante" : operation === "password" ? "Cambiar contraseña" : disabled ? "Activar acceso" : "Desactivar acceso"}
      </button>
    </form>
  );
}
