import { NextRequest, NextResponse } from 'next/server';

interface OverpassQuery {
  lat: number;
  lon: number;
  radius?: number;
}

/**
 * OSM Overpass API 查询建筑物数据
 * GET /api/buildings/overpass?lat=39.9042&lon=116.4074&radius=50
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lon = parseFloat(searchParams.get('lon') || '0');
    const radius = parseInt(searchParams.get('radius') || '50'); // 默认50米半径

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lon' },
        { status: 400 }
      );
    }

    // 构建 Overpass API 查询
    const overpassQuery = `
      [out:json][timeout:25];
      (
        way[building](around:${radius},${lat},${lon});
        relation[building](around:${radius},${lat},${lon});
      );
      out geom;
    `;

    // 调用 Overpass API
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const overpassData = await response.json();

    // 转换为 GeoJSON 格式
    const features = overpassData.elements
      .filter((element: any) => element.type === 'way' && element.geometry)
      .map((way: any) => {
        const coordinates = way.geometry.map((node: any) => [node.lon, node.lat]);
        
        // 确保多边形闭合
        if (coordinates.length > 0 && 
            (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
             coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
          coordinates.push(coordinates[0]);
        }

        return {
          type: 'Feature',
          properties: {
            osm_id: way.id,
            building: way.tags?.building || 'yes',
            'building:levels': way.tags?.['building:levels'],
            'building:height': way.tags?.['building:height'],
            height: way.tags?.height,
            levels: way.tags?.levels,
            'building:material': way.tags?.['building:material'],
            name: way.tags?.name,
            'building:type': way.tags?.['building:type'],
            source: 'osm_overpass'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates]
          }
        };
      });

    const geoJSON = {
      type: 'FeatureCollection',
      features: features
    };

    return NextResponse.json({
      success: true,
      data: geoJSON,
      meta: {
        source: 'osm_overpass',
        query: {
          lat,
          lon,
          radius
        },
        count: features.length
      }
    });

  } catch (error) {
    console.error('Overpass API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch building data from OSM',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * 根据OSM ID获取特定建筑物详细信息
 * POST /api/buildings/overpass
 */
export async function POST(request: NextRequest) {
  try {
    const { osm_id } = await request.json();

    if (!osm_id) {
      return NextResponse.json(
        { error: 'Missing required parameter: osm_id' },
        { status: 400 }
      );
    }

    // 构建查询特定建筑物的 Overpass 查询
    const overpassQuery = `
      [out:json][timeout:25];
      (
        way(${osm_id});
        relation(${osm_id});
      );
      out geom;
    `;

    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const overpassData = await response.json();

    if (!overpassData.elements || overpassData.elements.length === 0) {
      return NextResponse.json(
        { error: 'Building not found' },
        { status: 404 }
      );
    }

    const element = overpassData.elements[0];
    
    return NextResponse.json({
      success: true,
      data: {
        osm_id: element.id,
        type: element.type,
        tags: element.tags,
        geometry: element.geometry,
        source: 'osm_overpass'
      }
    });

  } catch (error) {
    console.error('Overpass API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch building details from OSM',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
