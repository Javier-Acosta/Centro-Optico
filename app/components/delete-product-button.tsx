'use client';

import { useFormStatus } from "react-dom";

export function DeleteProductButton({ productName }: { productName: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        const confirmed = window.confirm(`Eliminar "${productName}"? Esta accion borra la publicacion y su imagen.`);
        if (!confirmed) event.preventDefault();
      }}
      className="w-full rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
