import "server-only";
import type { OrderItemSnapshot } from "./pocketbase";

export const sellerWhatsAppNumber = process.env.SELLER_WHATSAPP_NUMBER || "5493834523879";

export function buildWhatsAppOrderUrl(order: {
  publicToken: string;
  email: string;
  totalMinor: number;
  currency: string;
  items: OrderItemSnapshot[];
}) {
  const lines = [
    "Hola, quiero hacer este pedido en Tienda Cata:",
    "",
    ...order.items.map((item) => `- ${item.productName} x ${item.quantity}: ${formatAmount(item.subtotalMinor, order.currency)}`),
    "",
    `Total: ${formatAmount(order.totalMinor, order.currency)}`,
    `Email/contacto: ${order.email}`,
    `Referencia: ${order.publicToken}`,
  ];

  return `https://wa.me/${sellerWhatsAppNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function formatAmount(minor: number, currency: string) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(minor / 100);
}
