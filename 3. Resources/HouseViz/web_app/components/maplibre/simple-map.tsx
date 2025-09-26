"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { useTranslations } from "next-intl";

interface SimpleMapProps {
  width?: string;
  height?: string;
  center?: [number, number];
  zoom?: number;
  apiKey?: string;
  navigationPosition?: maplibregl.ControlPosition;
  showGeolocate?: boolean;
  geolocatePosition?: maplibregl.ControlPosition;
  showScale?: boolean;
  scalePosition?: maplibregl.ControlPosition;
  showFullscreen?: boolean;
  onMapReady?: (map: maplibregl.Map) => void;
  onBuildingClick?: (feature: any) => void;
  enableBuildingSelection?: boolean;
  minZoomForSelection?: number;
  onZoomChange?: (zoom: number) => void;
}

export default function SimpleMap({
  width = "100%",
  height = "400px",
  center = [116.4074, 39.9042], // 北京坐标作为默认值
  zoom = 10,
  apiKey,
  navigationPosition = "bottom-right",
  showGeolocate = true,
  geolocatePosition = "bottom-right",
  showScale = true,
  scalePosition = "bottom-left",
  showFullscreen = false,
  onMapReady,
  onBuildingClick,
  enableBuildingSelection = false,
  minZoomForSelection = 12,
  onZoomChange,
}: SimpleMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const t = useTranslations();

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      // 获取Maptiler API key（优先使用props传入的服务端读取的变量）
      const maptilerApiKey = apiKey || process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

      if (!maptilerApiKey) {
        console.warn('NEXT_PUBLIC_MAPTILER_API_KEY is not defined');
      }

      // 使用Maptiler的街道样式，包含建筑物数据
      const styleUrl = maptilerApiKey
        ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerApiKey}`
        : 'https://demotiles.maplibre.org/style.json'; // 回退到演示样式

      map.current = new maplibregl.Map({
        container: mapContainer.current!,
        style: styleUrl,
        center: center,
        zoom: zoom,
        pitch: 0, // 初始俯视角度
        bearing: 0 // 初始方向
      });

      // 添加导航控件（缩放+指北针）
      map.current.addControl(new maplibregl.NavigationControl(), navigationPosition);

      // 定位控件
      if (showGeolocate) {
        const geo = new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true,
        });
        map.current.addControl(geo, geolocatePosition);
      }

      // 比例尺
      if (showScale) {
        map.current.addControl(new maplibregl.ScaleControl(), scalePosition);
      }

      // 全屏控件
      if (showFullscreen) {
        map.current.addControl(new maplibregl.FullscreenControl(), navigationPosition);
      }

      // 监听地图加载事件
      map.current.on('load', () => {
        console.log('Map loaded successfully with style:', styleUrl);
        onMapReady?.(map.current!);
      });

      // 监听错误事件
      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom, apiKey]);

  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) {
      return;
    }

    const buildingLayers = [
      'building',
      'building-3d',
      'building-extrusion',
      'building-fill',
      'buildings',
      'building-outline',
      'building-top',
      'building-wall',
      'building-height',
      'building-footprint'
    ];

    let activeBuildingLayers: string[] = [];
    let lastReportedZoom = Number.NaN;
    let selectionEnabledState = false;

    const computeSelectionEnabled = (zoomValue: number) => {
      return enableBuildingSelection || zoomValue >= minZoomForSelection;
    };

    const refreshActiveLayers = () => {
      activeBuildingLayers = buildingLayers.filter(layerId => {
        try {
          return Boolean(mapInstance.getLayer(layerId));
        } catch {
          return false;
        }
      });
    };

    const publishZoomIfNeeded = () => {
      const zoomValue = mapInstance.getZoom() || 0;
      if (!Number.isNaN(zoomValue) && Math.abs(zoomValue - lastReportedZoom) >= 0.01) {
        lastReportedZoom = zoomValue;
        onZoomChange?.(parseFloat(zoomValue.toFixed(2)));
      }
      return zoomValue;
    };

    const updateCursorState = (zoomValue: number) => {
      const enabled = computeSelectionEnabled(zoomValue);
      if (enabled !== selectionEnabledState) {
        selectionEnabledState = enabled;
        mapInstance.getCanvas().style.cursor = enabled ? 'crosshair' : '';
      }
    };

    const handleMoveOrZoom = () => {
      const zoomValue = publishZoomIfNeeded();
      updateCursorState(zoomValue);
    };

    const handleMouseMove = (e: maplibregl.MapMouseEvent & maplibregl.EventData) => {
      const zoomValue = mapInstance.getZoom() || 0;
      if (!computeSelectionEnabled(zoomValue)) {
        mapInstance.getCanvas().style.cursor = '';
        return;
      }

      if (activeBuildingLayers.length === 0) {
        refreshActiveLayers();
      }

      const hoverFeatures = mapInstance.queryRenderedFeatures(e.point, {
        layers: activeBuildingLayers
      });

      mapInstance.getCanvas().style.cursor = hoverFeatures.length > 0 ? 'pointer' : 'crosshair';
    };

    const handleMouseLeave = () => {
      const zoomValue = mapInstance.getZoom() || 0;
      if (computeSelectionEnabled(zoomValue)) {
        mapInstance.getCanvas().style.cursor = 'crosshair';
      } else {
        mapInstance.getCanvas().style.cursor = '';
      }
    };

    const handleMapClick = (e: maplibregl.MapMouseEvent & maplibregl.EventData) => {
      const zoomValue = mapInstance.getZoom() || 0;
      if (!computeSelectionEnabled(zoomValue)) {
        console.log(`Zoom level ${zoomValue.toFixed(2)} is below minimum ${minZoomForSelection} for building selection`);
        return;
      }

      if (activeBuildingLayers.length === 0) {
        refreshActiveLayers();
      }

      const allFeatures = mapInstance.queryRenderedFeatures(e.point);
      if (allFeatures.length === 0) {
        console.log('No features found at clicked location');
      } else {
        console.log('All features at click point:', allFeatures.map(f => ({ layer: f.layer?.id, properties: f.properties })));
      }

      const features = mapInstance.queryRenderedFeatures(e.point, {
        layers: activeBuildingLayers
      });

      if (features.length > 0) {
        onBuildingClick?.(features[0]);
        return;
      }

      const fallbackFeatures = allFeatures.filter(feature =>
        feature.properties?.building ||
        feature.properties?.['building:levels'] ||
        feature.properties?.height ||
        feature.layer?.id?.toLowerCase().includes('building')
      );

      if (fallbackFeatures.length > 0) {
        onBuildingClick?.(fallbackFeatures[0]);
      } else {
        console.log('No building found at clicked location');
      }
    };

    const attachHandlers = () => {
      refreshActiveLayers();
      handleMoveOrZoom();

      mapInstance.on('move', handleMoveOrZoom);
      mapInstance.on('zoom', handleMoveOrZoom);
      mapInstance.on('zoomend', handleMoveOrZoom);
      mapInstance.on('moveend', handleMoveOrZoom);
      mapInstance.on('styledata', () => {
        refreshActiveLayers();
        handleMoveOrZoom();
      });
      mapInstance.on('mousemove', handleMouseMove);
      mapInstance.on('mouseleave', handleMouseLeave);
      mapInstance.on('click', handleMapClick);
    };

    if (mapInstance.isStyleLoaded()) {
      attachHandlers();
    } else {
      mapInstance.once('load', attachHandlers);
    }

    return () => {
      mapInstance.off('move', handleMoveOrZoom);
      mapInstance.off('zoom', handleMoveOrZoom);
      mapInstance.off('zoomend', handleMoveOrZoom);
      mapInstance.off('moveend', handleMoveOrZoom);
      mapInstance.off('styledata', refreshActiveLayers);
      mapInstance.off('mousemove', handleMouseMove);
      mapInstance.off('mouseleave', handleMouseLeave);
      mapInstance.off('click', handleMapClick);
    };
  }, [enableBuildingSelection, minZoomForSelection, onBuildingClick, onZoomChange]);

  return (
    <div className="relative w-full h-full">
      <div
        id="maplibre-container"
        ref={mapContainer}
        className="w-full h-full"
        style={{ width, height }}
      />
      <div className="absolute top-2 left-2 bg-white px-3 py-1 rounded text-xs shadow-md border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="font-medium">Maplibre GL JS + Maptiler</span>
        </div>
      </div>
      <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded text-xs shadow-md border opacity-75">
        <div className="text-gray-600">Street Style</div>
      </div>
    </div>
  );
}
