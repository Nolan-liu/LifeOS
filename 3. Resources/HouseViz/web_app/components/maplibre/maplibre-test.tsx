"use client";

import { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";

export default function MaplibreTest() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // 检查Maplibre GL JS是否正确加载
      console.log("Maplibre GL JS version:", maplibregl.version);

      // 检查API key
      const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
      console.log("Maptiler API Key available:", !!apiKey);

      setIsLoaded(true);
    } catch (err) {
      console.error("Maplibre GL JS test failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, []);

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <h3 className="text-red-800 font-medium">Maplibre GL JS Test Failed</h3>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
      <h3 className="text-green-800 font-medium">Maplibre GL JS Test Passed</h3>
      <div className="text-green-600 text-sm mt-1">
        <p>✅ Maplibre GL JS version: {maplibregl.version || 'Unknown'}</p>
        <p>✅ API Key: {process.env.NEXT_PUBLIC_MAPTILER_API_KEY ? 'Configured' : 'Not configured'}</p>
        <p>✅ Status: {isLoaded ? 'Ready' : 'Loading...'}</p>
      </div>
    </div>
  );
}
