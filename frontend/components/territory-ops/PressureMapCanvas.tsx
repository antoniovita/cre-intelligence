"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Territory } from "@/lib/types";
import { pressureColor } from "@/lib/pressureColor";
import type { SimulatedUnit } from "./TerritoryOperationsScreen";

const RIO_CENTER: [number, number] = [-43.44, -22.91];

interface PressureMapCanvasProps {
  territories: Territory[];
  selectedId: string | null;
  /** Territory currently displayed for the selection, pressure possibly adjusted by the simulator. */
  displayedPressure: number | null;
  worstId: string | null;
  onSelect: (id: string) => void;
  /** When true, the map is in "place a new unit" mode: cursor changes and clicks report lat/lon instead of selecting a territory. */
  placingMode?: boolean;
  onPlaceUnit?: (lat: number, lon: number) => void;
  /** All simulated new units currently placed on the map. */
  units?: SimulatedUnit[];
  selectedUnitId?: string | null;
  onSelectUnit?: (id: string) => void;
}

interface MarkerRefs {
  el: HTMLButtonElement;
  hit: HTMLSpanElement;
  tip: HTMLSpanElement;
}

interface UnitMarkerRefs {
  marker: maplibregl.Marker;
  el: HTMLButtonElement;
}

export function PressureMapCanvas({
  territories,
  selectedId,
  displayedPressure,
  worstId,
  onSelect,
  placingMode = false,
  onPlaceUnit,
  units = [],
  selectedUnitId = null,
  onSelectUnit,
}: PressureMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, MarkerRefs>>(new Map());
  const prevSelectedRef = useRef<string | null>(null);
  const unitMarkersRef = useRef<Map<string, UnitMarkerRefs>>(new Map());

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
    // portion of the map it thought it had gets tiles. A ResizeObserver only
    // fires on a subsequent size *change*, so it does nothing if the
    // container was already wrong at construction time and never resizes
    // again afterwards — force a resize a couple of times right after
    // construction (rAF, so it runs after the browser's own layout pass) and
    // once more on "load", then let the observer take over for later changes.
    let rafId = requestAnimationFrame(() => {
      map.resize();
      rafId = requestAnimationFrame(() => map.resize());
    });
    map.once("load", () => map.resize());
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Placing-mode click handler + cursor. Kept in its own effect so it can
  // rebind onPlaceUnit without re-initializing the map.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const canvas = map.getCanvas();
    canvas.style.cursor = placingMode ? "crosshair" : "";
    // Toggling the overlay button's label can nudge layout right after the
    // map settles; re-check the container size defensively.
    map.resize();

    if (!placingMode || !onPlaceUnit) return;

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      onPlaceUnit(e.lngLat.lat, e.lngLat.lng);
    };
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [placingMode, onPlaceUnit]);

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
      // No inline `position` here: MapLibre appends this element straight
      // into the canvas container and positions it by writing an inline
      // `transform` (see marker.ts _update), relying on its own
      // `.maplibregl-marker { position: absolute }` class rule to take it out
      // of flow first. An inline `position: relative` would win the cascade
      // over that class (inline always beats a class, same trick as the map
      // container fix below) and leave the button in normal document flow,
      // so every marker's translate offset stacks on top of wherever the
      // browser laid it out in the DOM instead of the map's (0,0) — which is
      // exactly the "points scattered off their real spot" bug.
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

  // Markers for simulated new units (distinct from real territory markers).
  // Diffed by id against the current `units` prop so clicking one pin doesn't
  // recreate every other pin (which would drop hover/focus state and briefly
  // flash).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const seen = new Set(units.map((u) => u.id));
    unitMarkersRef.current.forEach((refs, id) => {
      if (!seen.has(id)) {
        refs.marker.remove();
        unitMarkersRef.current.delete(id);
      }
    });

    units.forEach((u) => {
      let refs = unitMarkersRef.current.get(u.id);
      if (!refs) {
        const el = document.createElement("button");
        el.type = "button";
        el.style.border = "none";
        el.style.padding = "0";
        el.style.cursor = "pointer";
        el.style.borderRadius = "50%";
        el.style.color = "#fff";
        el.style.display = "grid";
        el.style.placeItems = "center";
        el.style.fontSize = "14px";
        el.style.fontWeight = "700";
        el.style.lineHeight = "1";
        el.style.transition = "width .15s ease, height .15s ease";
        el.textContent = "+";
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelectUnit?.(u.id);
        });

        const marker = new maplibregl.Marker({ element: el }).setLngLat([u.longitude, u.latitude]).addTo(map);
        refs = { marker, el };
        unitMarkersRef.current.set(u.id, refs);
      } else {
        refs.marker.setLngLat([u.longitude, u.latitude]);
      }

      const isSelected = u.id === selectedUnitId;
      refs.el.style.width = isSelected ? "26px" : "22px";
      refs.el.style.height = isSelected ? "26px" : "22px";
      refs.el.style.background = "#2563eb";
      refs.el.style.border = isSelected ? "3px solid #fff" : "2.5px solid #fff";
      refs.el.style.boxShadow = isSelected
        ? "0 0 0 5px rgba(37,99,235,.25), 0 2px 8px rgba(0,0,0,.35)"
        : "0 2px 8px rgba(0,0,0,.35)";
      refs.el.style.zIndex = isSelected ? "5" : "3";
    });
  }, [units, selectedUnitId, onSelectUnit]);

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
