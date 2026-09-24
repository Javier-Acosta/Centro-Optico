import { redirect } from "next/navigation";
import { LoginForm } from "../components/login-form";
import { getStoreName } from "../lib/pocketbase";
import { isSellerAuthenticated } from "../lib/session";

export default async function AdminPage() {
  if (await isSellerAuthenticated()) redirect("/admin/productos");
  const storeName = await getStoreName();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
      <section className="w-full max-w-sm">
        <div className="mb-5">
          <p className="text-sm font-medium text-zinc-500">{storeName}</p>
          <h1 className="text-2xl font-bold text-zinc-950">Ingreso vendedor</h1>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}

