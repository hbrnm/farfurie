"use client";

import type { TrendPoint } from "@/lib/metabolism";

export function WeightTrendChart({ series }: { series: TrendPoint[] }) {
  if (series.length < 2) {
    return (
      <p className="text-sm text-ink-soft">—</p>
    );
  }
  const w = 320;
  const h = 140;
  const pad = { l: 8, r: 8, t: 10, b: 18 };
  const values = series.flatMap((p) => [p.trend, p.scale ?? p.trend]);
  const min = Math.min(...values) - 0.3;
  const max = Math.max(...values) + 0.3;
  const span = Math.max(max - min, 0.5);
  const x = (i: number) => pad.l + (i / (series.length - 1)) * (w - pad.l - pad.r);
  const y = (kg: number) => pad.t + (1 - (kg - min) / span) * (h - pad.t - pad.b);
  const trendPath = series
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.trend).toFixed(1)}`)
    .join(" ");
  const scalePath = series
    .map((p, i) => {
      const kg = p.scale ?? p.trend;
      return `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(kg).toFixed(1)}`;
    })
    .join(" ");
  const area = `${trendPath} L ${x(series.length - 1).toFixed(1)} ${h - pad.b} L ${x(0).toFixed(1)} ${h - pad.b} Z`;
  const last = series[series.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full" role="img" aria-label="Weight trend">
      <path d={area} fill="color-mix(in srgb, var(--brand) 16%, transparent)" />
      <path
        d={scalePath}
        fill="none"
        stroke="color-mix(in srgb, var(--ink) 28%, transparent)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d={trendPath} fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinejoin="round" />
      <circle cx={x(series.length - 1)} cy={y(last.trend)} r="4.5" fill="var(--brand)" />
      <text x={pad.l} y={h - 4} fontSize="10" fill="var(--ink-soft)">
        {series[0].date.slice(5)}
      </text>
      <text x={w - pad.r - 36} y={h - 4} fontSize="10" fill="var(--ink-soft)">
        {last.date.slice(5)}
      </text>
    </svg>
  );
}
