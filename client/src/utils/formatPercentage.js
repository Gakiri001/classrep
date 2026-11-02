export function formatPercentage(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `${Math.max(0, Math.min(100, number))}%` : '0%';
}
