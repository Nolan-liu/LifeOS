"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Building, Ruler, Home, MapPin, AlertTriangle, CheckCircle } from "lucide-react";
import { analyzeBuilding, type BuildingFeature, type BuildingAnalysis } from "@/services/building-data";

interface BuildingInfoPopupProps {
  feature: any;
  onClose: () => void;
  onAnalyze?: (feature: any) => void;
  position?: { x: number; y: number };
}

export default function BuildingInfoPopup({
  feature,
  onClose,
  onAnalyze,
  position = { x: 50, y: 50 }
}: BuildingInfoPopupProps) {
  const t = useTranslations();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<BuildingAnalysis | null>(null);

  // 分析建筑物数据
  useEffect(() => {
    if (feature) {
      const buildingAnalysis = analyzeBuilding(feature as BuildingFeature);
      setAnalysis(buildingAnalysis);
    }
  }, [feature]);

  if (!feature) return null;

  const properties = feature.properties || {};
  
  // 提取建筑物属性
  const buildingType = properties.building || properties['building:type'] || '未知';
  const height = properties.height || properties['building:height'];
  const levels = properties.levels || properties['building:levels'] || properties['building:part:levels'];
  const material = properties['building:material'] || properties.material;
  const name = properties.name || properties['building:name'];
  const osmId = properties.osm_id || properties.id;
  const source = properties.source || 'unknown';

  // 使用分析结果
  const isHighRise = analysis?.isHighRise || false;
  const estimatedLevels = analysis?.estimatedLevels;
  const computedHeight = analysis?.computedHeight;
  const dataQuality = analysis?.dataQuality || 'estimated';
  const missingData = analysis?.missingData || [];

  const handleAnalyze = () => {
    if (onAnalyze) {
      setIsAnalyzing(true);
      onAnalyze(feature);
      // 这里可以添加loading状态处理
      setTimeout(() => setIsAnalyzing(false), 1000);
    }
  };

  return (
    <div 
      className="fixed z-50 max-w-sm"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <Card className="shadow-lg border-2 bg-white/95 backdrop-blur">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                {name || '建筑物'}
              </CardTitle>
              <CardDescription>
                {buildingType !== '未知' && (
                  <Badge variant="secondary" className="text-xs">
                    {buildingType}
                  </Badge>
                )}
                {isHighRise && (
                  <Badge variant="default" className="ml-1 text-xs">
                    高层建筑
                  </Badge>
                )}
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* 建筑物基本信息 */}
          <div className="space-y-2">
            {height && (
              <div className="flex items-center gap-2 text-sm">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span>高度: {height}m</span>
              </div>
            )}
            
            {(levels || estimatedLevels) && (
              <div className="flex items-center gap-2 text-sm">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span>
                  楼层: {levels || `${estimatedLevels} (估算)`}
                  {levels && estimatedLevels && levels !== estimatedLevels.toString() && 
                    ` (地图数据: ${levels})`
                  }
                </span>
              </div>
            )}
            
            {material && (
              <div className="flex items-center gap-2 text-sm">
                <span>材料: {material}</span>
              </div>
            )}
            
            {osmId && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>ID: {osmId}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* 数据质量和来源说明 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">数据质量:</span>
              <Badge 
                variant={dataQuality === 'complete' ? 'default' : dataQuality === 'partial' ? 'secondary' : 'outline'}
                className="text-xs flex items-center gap-1"
              >
                {dataQuality === 'complete' ? (
                  <><CheckCircle className="h-3 w-3" /> 完整</>
                ) : dataQuality === 'partial' ? (
                  <><AlertTriangle className="h-3 w-3" /> 部分</>
                ) : (
                  <><AlertTriangle className="h-3 w-3" /> 估算</>
                )}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">数据来源:</span>
              <Badge variant="outline" className="text-xs">
                {source === 'osm_overpass' ? 'OSM' : 
                 source === 'maptiler' ? 'Maptiler' : 
                 'Maptiler/OSM'}
              </Badge>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? '分析中...' : '日照分析'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
            >
              关闭
            </Button>
          </div>

          {/* 高层建筑提示 */}
          {isHighRise && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800">
              💡 此建筑被识别为高层建筑，将需要您提供具体楼层信息进行精确分析。
            </div>
          )}

          {/* 数据缺失提示 */}
          {missingData.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
              <div className="flex items-center gap-1 mb-1">
                <AlertTriangle className="h-3 w-3" />
                <span className="font-medium">数据不完整</span>
              </div>
              <div>
                缺少: {missingData.join(', ')}
                {estimatedLevels && ', 楼层数为估算值'}
                {computedHeight && ', 高度为计算值'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
