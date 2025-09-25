"use client";

import { useState } from "react";
import maplibregl from "maplibre-gl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface MapStyle {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
}

const MAPTILER_STYLES: MapStyle[] = [
  {
    id: "streets-v2",
    name: "Streets",
    thumbnail: "https://api.maptiler.com/maps/streets-v2/static/116.4074,39.9042,10/300x200.png",
    description: "经典街道地图样式"
  },
  {
    id: "satellite",
    name: "Satellite",
    thumbnail: "https://api.maptiler.com/maps/satellite/static/116.4074,39.9042,10/300x200.png",
    description: "卫星图像"
  },
  {
    id: "terrain",
    name: "Terrain",
    thumbnail: "https://api.maptiler.com/maps/terrain/static/116.4074,39.9042,10/300x200.png",
    description: "地形图"
  },
  {
    id: "winter",
    name: "Winter",
    thumbnail: "https://api.maptiler.com/maps/winter/static/116.4074,39.9042,10/300x200.png",
    description: "冬季主题"
  },
  {
    id: "basic-v2",
    name: "Basic",
    thumbnail: "https://api.maptiler.com/maps/basic-v2/static/116.4074,39.9042,10/300x200.png",
    description: "基础地图"
  }
];

interface StyleSelectorProps {
  onStyleChange?: (style: string) => void;
}

export default function StyleSelector({ onStyleChange }: StyleSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState("streets-v2");
  const t = useTranslations();

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    if (onStyleChange) {
      const maptilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
      const styleUrl = maptilerApiKey
        ? `https://api.maptiler.com/maps/${styleId}/style.json?key=${maptilerApiKey}`
        : 'https://demotiles.maplibre.org/style.json';
      onStyleChange(styleUrl);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>选择地图样式</CardTitle>
        <CardDescription>
          Maptiler 提供多种地图样式，您可以点击下方选项切换样式
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {MAPTILER_STYLES.map((style) => (
            <div
              key={style.id}
              className={`relative cursor-pointer transition-all duration-200 ${
                selectedStyle === style.id
                  ? "ring-2 ring-primary ring-offset-2"
                  : "hover:scale-105"
              }`}
              onClick={() => handleStyleSelect(style.id)}
            >
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border">
                <img
                  src={style.thumbnail}
                  alt={style.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 如果缩略图加载失败，显示占位符
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvTwvdGV4dD48L3N2Zz4=';
                  }}
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
                <div className="text-sm font-medium">{style.name}</div>
                <div className="text-xs opacity-90">{style.description}</div>
              </div>
              {selectedStyle === style.id && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-sm text-blue-800">
              <strong>当前样式：</strong>{MAPTILER_STYLES.find(s => s.id === selectedStyle)?.name || 'Streets'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
