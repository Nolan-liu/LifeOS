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
  minZoomForSelection = 15,
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
        
        // 设置建筑物选择功能
        if (enableBuildingSelection) {
          setupBuildingSelection();
        }
        
        onMapReady?.(map.current!);
      });

      // 监听错误事件
      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

      // 设置建筑物选择功能
      const setupBuildingSelection = () => {
        if (!map.current) return;

        // 监听地图点击事件
        map.current.on('click', (e) => {
          const currentZoom = map.current?.getZoom() || 0;
          
          // 只有在足够的缩放级别才启用建筑物选择
          if (currentZoom < minZoomForSelection) {
            console.log(`Zoom level ${currentZoom} is below minimum ${minZoomForSelection} for building selection`);
            return;
          }

          // 查询点击位置的建筑物要素
          const features = map.current!.queryRenderedFeatures(e.point, {
            layers: ['building', 'building-3d', 'building-extrusion'] // 可能的建筑物图层名称
          });

          if (features.length > 0) {
            const buildingFeature = features[0];
            console.log('Building clicked:', buildingFeature);
            
            // 调用回调函数
            onBuildingClick?.(buildingFeature);
          } else {
            console.log('No building found at clicked location');
          }
        });

        // 监听缩放变化，动态显示建筑物选择提示
        map.current.on('zoom', () => {
          const currentZoom = map.current?.getZoom() || 0;
          const container = map.current?.getContainer();
          
          if (container) {
            if (currentZoom >= minZoomForSelection) {
              container.style.cursor = 'crosshair';
            } else {
              container.style.cursor = '';
            }
          }
        });

        // 鼠标悬停建筑物时改变光标
        map.current.on('mouseenter', 'building', () => {
          const currentZoom = map.current?.getZoom() || 0;
          if (currentZoom >= minZoomForSelection) {
            map.current!.getCanvas().style.cursor = 'pointer';
          }
        });

        map.current.on('mouseleave', 'building', () => {
          const currentZoom = map.current?.getZoom() || 0;
          if (currentZoom >= minZoomForSelection) {
            map.current!.getCanvas().style.cursor = 'crosshair';
          } else {
            map.current!.getCanvas().style.cursor = '';
          }
        });
      };
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom]);

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
