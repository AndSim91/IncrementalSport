const compactNumber = new Intl.NumberFormat("it-IT", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

const compactCurrency = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

const exactNumber = new Intl.NumberFormat("it-IT");
const exactCurrency = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

export function formatCompactNumber(value: number): string {
  return compactNumber.format(value);
}

export function formatCompactCurrency(value: number): string {
  return compactCurrency.format(value);
}

export function formatExactNumber(value: number): string {
  return exactNumber.format(value);
}

export function formatExactCurrency(value: number): string {
  return exactCurrency.format(value);
}
