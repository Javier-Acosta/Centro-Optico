"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSellerSession } from "./session";
import { createSuperuserPocketBase } from "./pocketbase";
import type { ActionState } from "./actions";

export async function manageSeller(_state: ActionState, form: FormData): Promise<ActionState> {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (origin && new URL(origin).host !== headerStore.get("host")) return { message: "Origen no permitido." };
  const session = await getSellerSession();
  if (session?.role !== "admin") return { message: "Solo el administrador puede gestionar usuarios." };

  const operation = String(form.get("operation") || "");
  const password = String(form.get("password") || "");
  if (["create", "password"].includes(operation) && (password.length < 12 || password.length > 72)) {
    return { message: "La contraseña debe tener entre 12 y 72 caracteres." };
  }
  try {
    const pb = await createSuperuserPocketBase();
    if (operation === "create") {
      const name = String(form.get("name") || "").trim();
      const email = String(form.get("email") || "").trim().toLowerCase();
      if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { message: "Ingresá un nombre y un email válidos." };
      }
      await pb.collection("sellers").create({ name, email, password, passwordConfirm: password, role: "assistant", disabled: false });
    } else if (["password", "disable", "enable"].includes(operation)) {
      const id = String(form.get("id") || "");
      const target = await pb.collection("sellers").getOne(id);
      // Never accept a role or arbitrary account fields from the browser.
      if (target.role !== "assistant" || target.id === session.id) {
        return { message: "Solo podés modificar cuentas de ayudantes." };
      }
      await pb.collection("sellers").update(id, operation === "password"
        ? { password, passwordConfirm: password }
        : { disabled: operation === "disable" });
    } else {
      return { message: "Operación no válida." };
    }
    revalidatePath("/admin/usuarios");
    return { ok: true, message: operation === "create" ? "Ayudante creado. Ya puede ingresar con su email y contraseña." : "Usuario actualizado." };
  } catch {
    return { message: "No se pudo guardar. Revisá los datos; el email puede estar en uso." };
  }
}
