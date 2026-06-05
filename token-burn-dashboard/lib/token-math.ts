import type { BurnRow } from "./burn-data";
import { toUtcDate } from "./date-windows";

export function formatTokens(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${Math.round(value)}`;
}

export function sumExactTokens(rows: BurnRow[]) {
  return rows.reduce((sum, row) => sum + row.exact_total, 0);
}

export function sumEstimateLow(rows: BurnRow[]) {
  return rows.reduce((sum, row) => sum + row.chat_tokens_low, 0);
}

export function sumEstimateHigh(rows: BurnRow[]) {
  return rows.reduce((sum, row) => sum + row.chat_tokens_high, 0);
}

export function logHeatLevel(value: number, max: number) {
  if (value <= 0 || max <= 0) return 0;
  const level = Math.ceil((Math.log10(value + 1) / Math.log10(max + 1)) * 5);
  return Math.max(0, Math.min(5, level));
}

export function movingAverageExact7(rows: BurnRow[], index: number) {
  const start = Math.max(0, index - 6);
  const windowRows = rows.slice(start, index + 1);
  return sumExactTokens(windowRows) / windowRows.length;
}

export function weeklyTotalsExact(rows: BurnRow[]) {
  const totals = new Map<string, number>();

  for (const row of rows) {
    const week = startOfIsoWeek(row.date);
    totals.set(week, (totals.get(week) || 0) + row.exact_total);
  }

  return Array.from(totals, ([week, total]) => ({ week, total })).sort((a, b) =>
    a.week.localeCompare(b.week),
  );
}

export function fermiScale(exactTokens: number) {
  const words = exactTokens * 0.75;
  const readingHours = words / 250 / 60;
  const novels = words / 90_000;

  return [
    {
      label: "Approx. words",
      value: `${formatTokens(words)}`,
      note: "tokens x 0.75 words",
    },
    {
      label: "Reading time",
      value: `${readingHours.toFixed(1)}h`,
      note: "250 words per minute",
    },
    {
      label: "Novel equivalents",
      value: `${novels.toFixed(2)}`,
      note: "90k words per novel",
    },
  ];
}

function startOfIsoWeek(date: string) {
  const value = toUtcDate(date);
  const day = (value.getUTCDay() + 6) % 7;
  value.setUTCDate(value.getUTCDate() - day);
  return value.toISOString().slice(0, 10);
}
