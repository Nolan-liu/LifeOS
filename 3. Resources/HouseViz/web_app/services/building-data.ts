/**
 * 建筑物数据服务 - 集成多个数据源
 * 按优先级：Maptiler Vector Tiles > OSM Overpass API
 */

export interface BuildingProperties {
  osm_id?: string | number;
  building?: string;
  'building:levels'?: string | number;
  'building:height'?: string | number;
  height?: string | number;
  levels?: string | number;
  'building:material'?: string;
  'building:type'?: string;
  name?: string;
  source?: string;
}

export interface BuildingFeature {
  type: 'Feature';
  properties: BuildingProperties;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface BuildingAnalysis {
  isHighRise: boolean;
  estimatedLevels?: number;
  computedHeight?: number;
  dataQuality: 'complete' | 'partial' | 'estimated';
  missingData: string[];
}

/**
 * 建筑物高层判定逻辑（按技术方案）
 */
export function analyzeBuilding(feature: BuildingFeature): BuildingAnalysis {
  const props = feature.properties;
  const HIGH_RISE_FLOORS = 6;
  const HIGH_RISE_HEIGHT = 18; // 米
  const DEFAULT_FLOOR_HEIGHT = 3.0;

  let height = props.height || props['building:height'];
  let levels = props.levels || props['building:levels'];
  
  // 类型转换
  if (typeof height === 'string') height = parseFloat(height);
  if (typeof levels === 'string') levels = parseInt(levels);

  const missingData: string[] = [];
  let estimatedLevels: number | undefined;
  let computedHeight: number | undefined;
  let dataQuality: 'complete' | 'partial' | 'estimated' = 'complete';

  // 数据完整性检查
  if (!height) {
    missingData.push('height');
    if (levels) {
      computedHeight = (levels as number) * DEFAULT_FLOOR_HEIGHT;
      height = computedHeight;
    }
  }

  if (!levels) {
    missingData.push('levels');
    if (height) {
      estimatedLevels = Math.ceil((height as number) / DEFAULT_FLOOR_HEIGHT);
      levels = estimatedLevels;
    }
  }

  // 确定数据质量
  if (missingData.length > 0) {
    dataQuality = missingData.length === 1 ? 'partial' : 'estimated';
  }

  // 高层建筑判定
  const isHighRise = (levels && (levels as number) >= HIGH_RISE_FLOORS) || 
                     (height && (height as number) >= HIGH_RISE_HEIGHT);

  return {
    isHighRise: !!isHighRise,
    estimatedLevels,
    computedHeight,
    dataQuality,
    missingData
  };
}

/**
 * 查询周边建筑物（用于3D建模）
 */
export async function fetchNearbyBuildings(
  lat: number,
  lon: number,
  radius: number = 100
): Promise<{ features: BuildingFeature[], source: string }> {
  try {
    // 首先尝试使用 OSM Overpass API（作为演示）
    const response = await fetch(`/api/buildings/overpass?lat=${lat}&lon=${lon}&radius=${radius}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data.features.length > 0) {
        return {
          features: data.data.features,
          source: 'osm_overpass'
        };
      }
    }

    // 如果OSM没有数据，可以在这里添加其他数据源
    // TODO: 集成 Maptiler Buildings API 或其他商业数据源
    
    return {
      features: [],
      source: 'none'
    };

  } catch (error) {
    console.error('Error fetching nearby buildings:', error);
    return {
      features: [],
      source: 'error'
    };
  }
}

/**
 * 获取建筑物详细信息
 */
export async function fetchBuildingDetails(osmId: string): Promise<BuildingFeature | null> {
  try {
    const response = await fetch('/api/buildings/overpass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ osm_id: osmId })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // 转换为标准 BuildingFeature 格式
        return {
          type: 'Feature',
          properties: {
            ...data.data.tags,
            osm_id: data.data.osm_id,
            source: data.data.source
          },
          geometry: {
            type: 'Polygon',
            coordinates: [data.data.geometry.map((node: any) => [node.lon, node.lat])]
          }
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching building details:', error);
    return null;
  }
}

/**
 * 验证用户输入的楼层信息
 */
export function validateFloorInput(
  userFloor: number,
  totalFloors: number,
  buildingFeature: BuildingFeature
): {
  isValid: boolean;
  warnings: string[];
  recommendations: string[];
} {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // 基本范围检查
  const isValid = userFloor >= 1 && userFloor <= totalFloors && totalFloors <= 100;

  if (!isValid) {
    if (userFloor < 1) warnings.push('楼层数不能小于1');
    if (userFloor > totalFloors) warnings.push('所居楼层不能超过建筑总层数');
    if (totalFloors > 100) warnings.push('建筑总层数超过常理范围');
  }

  // 与地图数据的一致性检查
  const analysis = analyzeBuilding(buildingFeature);
  const mapLevels = buildingFeature.properties.levels || buildingFeature.properties['building:levels'];
  
  if (mapLevels && Math.abs(Number(mapLevels) - totalFloors) > 2) {
    warnings.push(`您输入的总层数(${totalFloors})与地图数据(${mapLevels})存在较大差异`);
    recommendations.push('建议使用地图数据或联系客服核验');
  }

  if (analysis.dataQuality === 'estimated') {
    recommendations.push('建筑物数据不完整，分析结果仅供参考');
  }

  return {
    isValid,
    warnings,
    recommendations
  };
}
