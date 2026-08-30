"use client";

import { useState } from "react";
import { useJsonData } from "@/lib/useJsonData";
import type { Territory } from "@/lib/types";
import { pressureDistribution } from "@/lib/pressureDistribution";

export function PressureDistributionChart() {
  const { data, loading, error } = useJsonData<Territory[]>(
    "/data/territories.json"
  );
  const [hovered, setHovered] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white" />
    );
  }

  if (error) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-red-600">
        <span aria-hidden="true">✕</span>
        Erro ao carregar territórios: {error}
      </p>
    );
  }

  const buckets = pressureDistribution(data ?? []);
  const maxCount = Math.max(...buckets.map((b) => b.count), 1);
  const hoveredBucket = buckets.find((b) => b.label === hovered);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Distribuição de pressão
        </h3>
        <span className="text-xs text-slate-400">
          {hoveredBucket
            ? `${hoveredBucket.count} território${hoveredBucket.count === 1 ? "" : "s"}`
            : `${data?.length ?? 0} territórios no total`}
        </span>
      </div>

      <div className="mt-4 flex h-40 items-end justify-between gap-2 sm:gap-3">
        {buckets.map((bucket) => {
          const heightPct = (bucket.count / maxCount) * 100;
          return (
            <div
              key={bucket.label}
              className="flex flex-1 flex-col items-center gap-1.5"
              onMouseEnter={() => setHovered(bucket.label)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="text-xs font-semibold tabular-nums text-slate-700">
                {bucket.count}
              </span>
              <div className="flex h-32 w-full max-w-9 items-end">
                <div
                  className="w-full rounded-t-sm transition-opacity"
                  style={{
                    height: `${Math.max(heightPct, bucket.count > 0 ? 4 : 0)}%`,
                    backgroundColor: bucket.color,
                    opacity: hovered && hovered !== bucket.label ? 0.5 : 1,
                  }}
                />
              </div>
              <span className="text-center text-[11px] leading-tight text-slate-500">
                {bucket.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
