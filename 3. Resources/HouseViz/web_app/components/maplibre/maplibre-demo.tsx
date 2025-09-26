"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import SimpleMap from "@/components/maplibre/simple-map";
import MaplibreErrorBoundary from "@/components/maplibre/error-boundary";
import BuildingInfoPopup from "@/components/maplibre/building-info-popup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Layers, PenTool, Ruler, Share2, Settings } from "lucide-react";

interface MaplibreDemoProps {
  apiKey: string;
}

export default function MaplibreDemo({ apiKey }: MaplibreDemoProps) {
  const t = useTranslations();
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [currentZoom, setCurrentZoom] = useState(10);
  const zoomChangeTimeout = useRef<NodeJS.Timeout | null>(null);
  const isSelectionEnabled = useMemo(() => currentZoom >= 15, [currentZoom]);

  const handleZoomChange = useCallback((zoomValue: number) => {
    if (zoomChangeTimeout.current) {
      clearTimeout(zoomChangeTimeout.current);
    }
    zoomChangeTimeout.current = setTimeout(() => {
      setCurrentZoom(zoomValue);
      zoomChangeTimeout.current = null;
    }, 30);
  }, []);

  useEffect(() => {
    return () => {
      if (zoomChangeTimeout.current) {
        clearTimeout(zoomChangeTimeout.current);
      }
    };
  }, []);

  const handleBuildingClick = useCallback((feature: any) => {
    console.log('Building selected:', feature);
    setSelectedBuilding(feature);
    
    // 计算弹窗位置（简化版，实际应该基于地理坐标转换）
    setPopupPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });
  }, []);

  const handleCloseBuildingInfo = useCallback(() => {
    setSelectedBuilding(null);
  }, []);

  const handleAnalyzeBuilding = useCallback((feature: any) => {
    console.log('Starting analysis for building:', feature);
    // TODO: 在这里触发3D分析流程
    // 可以导航到分析页面或打开分析模态框
    alert(`开始分析建筑物: ${feature.properties?.name || 'Unknown Building'}`);
  }, []);

  const minZoomForSelection = 15;

  return (
    <div className="relative w-full h-full">
      {/* 地图容器全屏占位 */}
      <MaplibreErrorBoundary>
        <SimpleMap
          width="100%"
          height="100vh"
          center={[116.4074, 39.9042]} // 北京坐标
          zoom={10}
          apiKey={apiKey}
          navigationPosition="bottom-right"
          geolocatePosition="bottom-right"
          scalePosition="bottom-left"
          showFullscreen={false}
          enableBuildingSelection={false}
          minZoomForSelection={minZoomForSelection}
          onBuildingClick={handleBuildingClick}
          onZoomChange={handleZoomChange}
        />
      </MaplibreErrorBoundary>

      {/* 左上角：搜索框 */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input className="w-80 border-0 bg-transparent focus-visible:ring-0" placeholder="搜索地点、地址、POI" />
          <Button size="sm">搜索</Button>
        </div>
      </div>

      {/* 右上角：操作区 */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur rounded-lg shadow border p-2 flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Layers className="h-4 w-4 mr-1" />
            图层
          </Button>
          <Button variant="outline" size="sm">
            <PenTool className="h-4 w-4 mr-1" />
            绘制
          </Button>
          <Button variant="outline" size="sm">
            <Ruler className="h-4 w-4 mr-1" />
            测距
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            分享
          </Button>
        </div>
      </div>

      {/* 左下角：分析模式切换 */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white/90 backdrop-blur rounded-lg shadow border p-3 max-w-xs space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Settings className="h-4 w-4" />
            建筑物分析提示
          </div>
          <div className="text-xs text-gray-600 leading-relaxed">
            <p>缩放至 {minZoomForSelection}+ 级别后，地图将自动进入建筑物点选模式。</p>
            <p>鼠标移动到建筑上会出现「小手」光标，点击即可查看属性。</p>
          </div>
          <div className="border-t pt-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">当前缩放</span>
              <span className="font-medium">{currentZoom.toFixed(1)}</span>
            </div>
            {currentZoom < minZoomForSelection ? (
              <div className="mt-1 text-orange-600">
                请继续放大至 {minZoomForSelection}+ 级别以启用选择。
              </div>
            ) : (
              <Badge variant="secondary" className="mt-2">
                点选模式已激活
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* 建筑物信息弹窗 */}
      {selectedBuilding && (
        <BuildingInfoPopup
          feature={selectedBuilding}
          position={popupPosition}
          onClose={handleCloseBuildingInfo}
          onAnalyze={handleAnalyzeBuilding}
        />
      )}

      {/* 状态指示器 */}
      <div className="absolute bottom-4 right-20 z-10">
        <div className="bg-white/80 backdrop-blur px-3 py-1 rounded text-xs border">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>
              {apiKey ? 'Maptiler 3D + Buildings' : 'Demo Style'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
