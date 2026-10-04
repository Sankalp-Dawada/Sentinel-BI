export function percentChange(
  current: number,
  previous: number
): number | null {

  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return ((current - previous) / previous) * 100;
}

export function direction(
  change: number | null
): "up" | "down" | "flat" {

  if (
    change === null ||
    Math.abs(change) < 0.005
  ) {
    return "flat";
  }

  return change > 0
    ? "up"
    : "down";
}

export function formatCurrency(
  value: number
): string {

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }
  ).format(value);
}
