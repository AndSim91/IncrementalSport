const currencyFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});
const timeFormatter = new Intl.DateTimeFormat("it-IT", {
  hour: "2-digit",
  minute: "2-digit",
});
const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "medium",
  timeStyle: "short",
});
const dateFormatter = new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" });
const clockFormatter = new Intl.DateTimeFormat("it-IT", { timeStyle: "medium" });
const longDateFormatter = new Intl.DateTimeFormat("it-IT", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatTime(value: number): string {
  return timeFormatter.format(value);
}

export function formatDateTime(value: number): string {
  return dateTimeFormatter.format(value);
}

export function formatDate(value: number): string {
  return dateFormatter.format(value);
}

export function formatClock(value: number): string {
  return clockFormatter.format(value);
}

export function formatLongDate(value: number): string {
  return longDateFormatter.format(value);
}
