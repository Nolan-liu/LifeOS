import { getTranslations } from "next-intl/server";
import SimpleMap from "@/components/maplibre/simple-map";

export default async function MaplibreDemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t("maplibre.demo")}</h1>
      <p className="text-muted-foreground mb-4">{t("maplibre.version", { version: "5.7.3" })}</p>

      {/* 实际的Maplibre地图演示 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">实时地图演示</h2>
        <SimpleMap
          width="100%"
          height="400px"
          center={[116.4074, 39.9042]} // 北京坐标
          zoom={10}
        />
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">安装信息：</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ Maplibre GL JS v5.7.3 已安装</li>
          <li>✅ {t("maplibre.features.rendering")}</li>
          <li>✅ {t("maplibre.features.vector_tiles")}</li>
          <li>✅ {t("maplibre.features.opensource")}，{t("maplibre.features.license")}</li>
          <li>✅ {t("maplibre.features.compatible")}</li>
        </ul>
      </div>

      <div className="mt-4 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">{t("maplibre.usage_example")}</h3>
        <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
          {t("maplibre.code_example")}
        </pre>
      </div>
    </div>
  );
}
