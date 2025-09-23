"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { useTranslations } from "next-intl";

interface SimpleMapProps {
  width?: string;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

export default function SimpleMap({
  width = "100%",
  height = "400px",
  center = [0, 0],
  zoom = 1
}: SimpleMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const t = useTranslations();

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://demotiles.maplibre.org/style.json', // 使用MapLibre演示样式
        center: center,
        zoom: zoom
      });

      // 添加导航控件
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      // 添加比例尺
      map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom]);

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        className="rounded-lg border"
        style={{ width, height }}
      />
      <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded text-xs shadow">
        Maplibre GL JS Demo
      </div>
    </div>
  );
}
