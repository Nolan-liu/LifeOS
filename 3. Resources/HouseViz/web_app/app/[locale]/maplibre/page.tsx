import { getTranslations } from "next-intl/server";
import MaplibreDemo from "@/components/maplibre/maplibre-demo";

export default async function MaplibrePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || process.env.NEXT_MAPTILER_API_KEY || "";

  return (
    <div className="fixed inset-0 w-screen h-screen">
      <MaplibreDemo apiKey={apiKey} />
    </div>
  );
}
