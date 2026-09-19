'use client';

import { useActionState, useEffect } from "react";
import { loginSeller, type ActionState } from "../lib/actions";

const initialState: ActionState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginSeller, initialState);

  useEffect(() => {
    if (state.ok) window.location.href = "/admin/productos";
  }, [state.ok]);

  return (
    <form action={action} className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <label className="grid gap-1 text-sm font-medium text-zinc-800">
        Email
        <input name="email" type="email" required autoComplete="username" className="rounded-md border border-zinc-300 px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm font-medium text-zinc-800">
        Contrasena
        <input name="password" type="password" required autoComplete="current-password" className="rounded-md border border-zinc-300 px-3 py-2" />
      </label>
      {state.message ? <p className="text-sm text-red-700">{state.message}</p> : null}
      <button disabled={pending} className="rounded-md bg-zinc-950 px-4 py-3 font-medium text-white disabled:bg-zinc-400">
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}

