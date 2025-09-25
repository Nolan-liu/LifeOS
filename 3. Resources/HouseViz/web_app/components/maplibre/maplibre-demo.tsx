"use client";

import { useState, useCallback } from "react";
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
  const [isAnalysisMode, setIsAnalysisMode] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(10);

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

  const toggleAnalysisMode = () => {
    setIsAnalysisMode(!isAnalysisMode);
    if (!isAnalysisMode) {
      setSelectedBuilding(null); // 清除选中状态
    }
  };

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
          enableBuildingSelection={isAnalysisMode}
          minZoomForSelection={minZoomForSelection}
          onBuildingClick={handleBuildingClick}
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
        <div className="bg-white/90 backdrop-blur rounded-lg shadow border p-2">
          <Button 
            variant={isAnalysisMode ? "default" : "outline"}
            size="sm"
            onClick={toggleAnalysisMode}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {isAnalysisMode ? '退出分析模式' : '建筑物分析模式'}
          </Button>
          
          {isAnalysisMode && (
            <div className="mt-2 text-xs text-gray-600 max-w-48">
              <Badge variant="secondary" className="mb-1">
                分析模式已启用
              </Badge>
              <p>放大到 {minZoomForSelection}+ 级别并点击建筑物进行分析</p>
              {currentZoom < minZoomForSelection && (
                <p className="text-orange-600 mt-1">
                  当前缩放级别: {currentZoom.toFixed(1)} (需要 {minZoomForSelection}+)
                </p>
              )}
            </div>
          )}
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
