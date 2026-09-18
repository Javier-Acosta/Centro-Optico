export function formatMoney(minor: number, currency = "ARS") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100);
}

export function parsePriceToMinor(value: FormDataEntryValue | null) {
  const text = String(value || "").trim().replace(/\./g, "").replace(",", ".");
  const number = Number(text);
  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.round(number * 100);
}
