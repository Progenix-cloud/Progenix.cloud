"use client";

import { cn } from "@/lib/utils";

export function Sparkline({
  data,
  height = 64,
  stroke = "#2563eb",
  fill = "transparent",
  className,
}: {
  data: number[];
  height?: number;
  stroke?: string;
  fill?: string;
  className?: string;
}) {
  if (!data || data.length < 2) {
    return (
      <div className={cn("text-xs text-muted-foreground", className)}>
        No data
      </div>
    );
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn("w-full", className)}
      style={{ height }}
    >
      <polyline
        fill={fill}
        stroke={stroke}
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}

export function ProgressBar({
  label,
  value,
  suffix = "%",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>
          {pct}
          {suffix}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-2 rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function BarList({
  items,
  formatValue,
}: {
  items: { label: string; value: number }[];
  formatValue?: (value: number) => string;
}) {
  if (!items || items.length === 0) {
    return <div className="text-sm text-muted-foreground">No data.</div>;
  }
  const max = Math.max(...items.map((i) => i.value)) || 1;
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const width = Math.max(4, (item.value / max) * 100);
        return (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{item.label}</span>
              <span>
                {formatValue ? formatValue(item.value) : item.value.toFixed(2)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-2 rounded-full bg-indigo-500"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
