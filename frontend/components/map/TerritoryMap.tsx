"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Territory } from "@/lib/types";

const RIO_CENTER: [number, number] = [-43.35, -22.92];
const DATA_URL = "/data/territories.mock.json";

// baixa pressão -> alta pressão
function pressureColor(pressure: number): string {
  if (pressure < 1) return "#22c55e";
  if (pressure < 2) return "#eab308";
  if (pressure < 3) return "#f97316";
  return "#ef4444";
}

interface TerritoryMapProps {
  onSelectTerritory?: (territory: Territory) => void;
}

export default function TerritoryMap({ onSelectTerritory }: TerritoryMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);

  useEffect(() => {
    fetch(DATA_URL)
      .then((res) => res.json())
      .then((data: Territory[]) => setTerritories(data))
      .catch((err) => console.error("Falha ao carregar territories:", err));
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
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
    if (!map || territories.length === 0) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    territories.forEach((territory) => {
      const el = document.createElement("div");
      el.style.width = "16px";
      el.style.height = "16px";
      el.style.borderRadius = "50%";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 0 4px rgba(0,0,0,0.4)";
      el.style.backgroundColor = pressureColor(territory.pressure);
      el.style.cursor = "pointer";

      el.addEventListener("click", () => onSelectTerritory?.(territory));

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([territory.longitude, territory.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [territories, onSelectTerritory]);

  return <div ref={containerRef} className="h-full w-full" />;
}
