export function formatCurrency(value: number) {
  return `RD$ ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatCurrencyShort(value: number) {
  return `RD$ ${value.toLocaleString("en-US")}`;
}
