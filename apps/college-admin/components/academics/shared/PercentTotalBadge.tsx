function sumPercent(items: Array<{ percent?: unknown }>): number {
  return items.reduce((sum, item) => sum + (Number(item.percent) || 0), 0);
}

export function PercentTotalBadge({
  items,
}: {
  items: Array<{ percent?: unknown }>;
}) {
  if (items.length === 0) return null;
  const total = sumPercent(items);
  const isComplete = total === 100;
  return (
    <span
      className={`text-xs font-semibold ${isComplete ? "text-green-600" : "text-destructive"}`}
    >
      Total: {total} / 100
    </span>
  );
}
