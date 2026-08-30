interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}

export function StatTile({ label, value, hint, accent }: StatTileProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className="mt-1 text-2xl font-semibold tabular-nums"
        style={{ color: accent ?? "#0f172a" }}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 truncate text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
