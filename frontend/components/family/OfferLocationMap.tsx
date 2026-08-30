"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface OfferLocationMapProps {
  latitude: number;
  longitude: number;
  unidade: string;
}

/**
 * Mapa pequeno centrado na creche ofertada — responde à pergunta concreta que
 * a família tem antes de decidir: "onde exatamente fica essa creche?".
 */
export function OfferLocationMap({ latitude, longitude, unidade }: OfferLocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
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
      center: [longitude, latitude],
      zoom: 14.5,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    const el = document.createElement("div");
    el.style.width = "22px";
    el.style.height = "22px";
    el.style.borderRadius = "50%";
    el.style.border = "3px solid white";
    el.style.backgroundColor = "#2563eb";
    el.style.boxShadow = "0 1px 6px rgba(0,0,0,0.45)";
    el.title = unidade;

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([longitude, latitude])
      .addTo(map);

    return () => {
      marker.remove();
      map.remove();
    };
  }, [latitude, longitude, unidade]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`Mapa mostrando a localização de ${unidade}`}
      className="h-44 w-full overflow-hidden rounded-lg border border-slate-200"
    />
  );
}
