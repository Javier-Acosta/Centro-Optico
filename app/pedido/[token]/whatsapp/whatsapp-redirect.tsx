"use client";

import { useEffect } from "react";

export function WhatsAppRedirect({ url }: { url: string }) {
  useEffect(() => {
    window.location.href = url;
  }, [url]);

  return (
    <a href={url} className="inline-flex rounded-md bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700">
      Abrir WhatsApp
    </a>
  );
}
