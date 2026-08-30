"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Territory } from "@/lib/types";
import { pressureColor } from "@/lib/pressureColor";

const RIO_CENTER: [number, number] = [-43.44, -22.91];

interface PressureMapCanvasProps {
  territories: Territory[];
  selectedId: string | null;
  /** Territory currently displayed for the selection, pressure possibly adjusted by the simulator. */
  displayedPressure: number | null;
  worstId: string | null;
  onSelect: (id: string) => void;
}

interface MarkerRefs {
  el: HTMLButtonElement;
  hit: HTMLSpanElement;
  tip: HTMLSpanElement;
}

export function PressureMapCanvas({
  territories,
  selectedId,
  displayedPressure,
  worstId,
  onSelect,
}: PressureMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, MarkerRefs>>(new Map());
  const prevSelectedRef = useRef<string | null>(null);

  // Init map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: RIO_CENTER,
      zoom: 9.7,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    mapRef.current = map;

    // MapLibre reads the container's size once at construction time and never
    // rechecks it on its own — if the flex layout around it settles to its
    // final size a frame later (or the sidebar/panel widths change), the
    // canvas is left stuck at whatever size it saw first, so only the
    // portion of the map it thought it had gets tiles. Force a resize once
    // the map has fully loaded (layout has settled by then) and again on
    // every subsequent container resize.
    map.once("load", () => map.resize());
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Create markers when territory data arrives.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || territories.length === 0) return;

    markersRef.current.forEach((refs) => refs.el.remove());
    markersRef.current = new Map();

    territories.forEach((t) => {
      const el = document.createElement("button");
      el.type = "button";
      el.title = t.name;
      el.style.position = "relative";
      el.style.border = "none";
      el.style.background = "none";
      el.style.padding = "0";
      el.style.cursor = "pointer";
      el.style.transform = "translate(-50%, -50%)";

      const hit = document.createElement("span");
      hit.style.display = "block";
      hit.style.width = "14px";
      hit.style.height = "14px";
      hit.style.borderRadius = "50%";
      hit.style.border = "2.5px solid #fff";
      hit.style.boxShadow = "0 1px 4px rgba(0,0,0,.32)";
      hit.style.transition = "background-color .4s ease, width .2s ease, height .2s ease";

      const tip = document.createElement("span");
      tip.style.position = "absolute";
      tip.style.bottom = "calc(100% + 10px)";
      tip.style.left = "50%";
      tip.style.transform = "translateX(-50%)";
      tip.style.whiteSpace = "nowrap";
      tip.style.background = "#fff";
      tip.style.border = "1px solid #e2e8f0";
      tip.style.borderRadius = "6px";
      tip.style.boxShadow = "0 4px 12px rgba(0,0,0,.12)";
      tip.style.padding = "4px 9px";
      tip.style.fontSize = "11.5px";
      tip.style.display = "none";
      tip.style.alignItems = "baseline";
      tip.style.gap = "6px";
      tip.style.color = "#0f172a";
      tip.style.fontFamily = "inherit";

      el.appendChild(tip);
      el.appendChild(hit);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelect(t.id);
      });
      el.addEventListener("mouseenter", () => {
        hit.style.width = "22px";
        hit.style.height = "22px";
      });
      el.addEventListener("mouseleave", () => {
        if (t.id !== prevSelectedRef.current) {
          hit.style.width = "14px";
          hit.style.height = "14px";
        }
      });

      new maplibregl.Marker({ element: el }).setLngLat([t.longitude, t.latitude]).addTo(map);
      markersRef.current.set(t.id, { el, hit, tip });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [territories]);

  // Sync marker color/size/tooltip/beacon on selection or simulation change.
  useEffect(() => {
    territories.forEach((t) => {
      const refs = markersRef.current.get(t.id);
      if (!refs) return;

      const isSelected = t.id === selectedId;
      const p = isSelected && displayedPressure !== null ? displayedPressure : t.pressure;
      const color = pressureColor(p);

      refs.hit.style.backgroundColor = color;

      if (isSelected) {
        refs.hit.style.width = "27px";
        refs.hit.style.height = "27px";
        refs.hit.style.boxShadow = `0 0 0 7px rgba(15,23,42,.1), 0 2px 8px rgba(0,0,0,.35)`;
        refs.el.style.zIndex = "4";
        refs.tip.style.display = "flex";
        refs.tip.innerHTML = "";
        refs.tip.append(document.createTextNode(t.name + " "));
        const b = document.createElement("b");
        b.textContent = p.toFixed(2);
        b.style.color = color;
        b.style.fontVariantNumeric = "tabular-nums";
        refs.tip.appendChild(b);
      } else {
        refs.hit.style.width = "14px";
        refs.hit.style.height = "14px";
        refs.hit.style.boxShadow = "0 1px 4px rgba(0,0,0,.32)";
        refs.el.style.zIndex = "2";
        refs.tip.style.display = "none";
      }

      const isBeacon = !selectedId && t.id === worstId;
      refs.hit.style.animation = isBeacon ? "cre-beacon-pulse 2s ease-out infinite" : "none";
    });

    if (selectedId && selectedId !== prevSelectedRef.current) {
      const t = territories.find((x) => x.id === selectedId);
      const map = mapRef.current;
      if (t && map) {
        map.easeTo({
          center: [t.longitude, t.latitude],
          zoom: Math.max(map.getZoom(), 11),
          duration: 750,
          offset: [0, -110],
        });
      }
    }
    prevSelectedRef.current = selectedId;
  }, [territories, selectedId, displayedPressure, worstId]);

  return (
    <>
      <style>{`
        @keyframes cre-beacon-pulse {
          0% { box-shadow: 0 0 0 0 rgba(37,99,235,.45); }
          70% { box-shadow: 0 0 0 16px rgba(37,99,235,0); }
          100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
        }
      `}</style>
      {/* inline style is required: maplibre-gl.css sets .maplibregl-map { position: relative },
          same specificity as the `absolute` utility class, and wins the cascade by import
          order — collapsing this container to a few px tall. Inline style always wins. */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ position: "absolute", inset: 0 }}
      />
    </>
  );
}
