"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Territory } from "@/lib/types";
import { useJsonData } from "@/lib/useJsonData";
import { availabilityLevel } from "@/lib/availabilityLevel";

const RIO_CENTER: [number, number] = [-43.35, -22.92];
const DATA_URL = "/data/territories.json";

const LEGEND = [
  availabilityLevel(0),
  availabilityLevel(1.5),
  availabilityLevel(3),
];

/**
 * Read-only map for families: same territory points as the manager's map,
 * but colored by a 3-tier plain-language category instead of the raw
 * pressure ratio — no numbers, no simulator, no demand/supply exposed.
 */
export function FamilyMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const { data: territories } = useJsonData<Territory[]>(DATA_URL);
  const [selected, setSelected] = useState<Territory | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: RIO_CENTER,
      zoom: 9.5,
    });
    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !territories || territories.length === 0) return;

    const markers: maplibregl.Marker[] = [];

    territories.forEach((territory) => {
      const level = availabilityLevel(territory.pressure);
      const el = document.createElement("div");
      el.style.width = "16px";
      el.style.height = "16px";
      el.style.borderRadius = "50%";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 0 4px rgba(0,0,0,0.4)";
      el.style.backgroundColor = level.color;
      el.style.cursor = "pointer";

      el.addEventListener("click", () => setSelected(territory));

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([territory.longitude, territory.latitude])
        .addTo(map);

      markers.push(marker);
    });

    return () => markers.forEach((m) => m.remove());
  }, [territories]);

  return (
    <div className="relative h-80 overflow-hidden rounded-xl border border-slate-200 sm:h-96">
      <div ref={containerRef} className="h-full w-full" />

      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-white/95 p-3 text-xs text-slate-600 shadow-md">
        <p className="mb-0.5 font-medium text-slate-900">Situação da região</p>
        {LEGEND.map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {label}
          </div>
        ))}
      </div>

      {selected && (
        <div className="absolute top-4 right-4 z-10 w-64 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900">{selected.name}</h3>
            <button
              onClick={() => setSelected(null)}
              aria-label="Fechar"
              className="text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          </div>
          <p
            className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ color: availabilityLevel(selected.pressure).color }}
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: availabilityLevel(selected.pressure).color }}
            />
            {availabilityLevel(selected.pressure).label}
          </p>
        </div>
      )}
    </div>
  );
}
