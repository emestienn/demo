import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import ResourceManager from "../../components/admin/ResourceManager.jsx";
import { citiesApi, neighborhoodsApi, adminCrud } from "../../api/content.js";

const citiesAdmin = adminCrud("/cities");
const neighborhoodsAdmin = adminCrud("/neighborhoods");

export default function AdminCities() {
  const { t } = useTranslation("admin");
  const [tab, setTab] = useState("cities");
  const { data: cities } = useQuery({ queryKey: ["all-cities"], queryFn: () => citiesApi.list() });
  const cityOptions = (cities?.data || []).map((c) => ({ value: c._id, label: c.name }));

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("cities")} className={`pill ${tab === "cities" ? "border-neon-purple text-neon-purple" : ""}`}>{t("cities.tabs.cities")}</button>
        <button onClick={() => setTab("neighborhoods")} className={`pill ${tab === "neighborhoods" ? "border-neon-purple text-neon-purple" : ""}`}>{t("cities.tabs.neighborhoods")}</button>
      </div>

      {tab === "cities" ? (
        <ResourceManager
          title={t("resources.cities.title")}
          singular={t("resources.cities.singular")}
          queryKey={["admin-cities"]}
          listFn={citiesApi.list}
          createFn={citiesAdmin.create}
          updateFn={citiesAdmin.update}
          deleteFn={citiesAdmin.remove}
          columns={[
            { key: "name", label: t("fields.cities.name") },
            { key: "region", label: t("fields.cities.region") },
            { key: "placeCount", label: t("fields.cities.placeCount"), render: (i) => i.stats?.placeCount || 0 },
          ]}
          fields={[
            { name: "name", label: t("fields.cities.name"), required: true },
            { name: "tagline", label: t("fields.cities.tagline") },
            { name: "description", label: t("fields.cities.description"), type: "textarea" },
            { name: "region", label: t("fields.cities.region") },
            { name: "bestSeason", label: t("fields.cities.bestSeason") },
            { name: "lat", label: t("fields.cities.lat"), type: "number", getValue: (i) => i.center?.lat },
            { name: "lng", label: t("fields.cities.lng"), type: "number", getValue: (i) => i.center?.lng },
          ]}
          emptyValues={{ name: "", tagline: "", description: "", region: "", bestSeason: "", lat: "", lng: "" }}
          transformPayload={(payload) => ({
            name: payload.name,
            tagline: payload.tagline,
            description: payload.description,
            region: payload.region,
            bestSeason: payload.bestSeason,
            center: { lat: Number(payload.lat) || 37.5, lng: Number(payload.lng) || 127 },
          })}
        />
      ) : (
        <ResourceManager
          title={t("resources.neighborhoods.title")}
          singular={t("resources.neighborhoods.singular")}
          queryKey={["admin-neighborhoods"]}
          listFn={neighborhoodsApi.list}
          createFn={neighborhoodsAdmin.create}
          updateFn={neighborhoodsAdmin.update}
          deleteFn={neighborhoodsAdmin.remove}
          columns={[
            { key: "name", label: t("fields.neighborhoods.name") },
            { key: "city", label: t("fields.neighborhoods.city"), render: (i) => i.city?.name },
            { key: "rating", label: t("fields.neighborhoods.rating") },
          ]}
          fields={[
            { name: "name", label: t("fields.neighborhoods.name"), required: true },
            { name: "city", label: t("fields.neighborhoods.city"), type: "select", options: cityOptions, required: true },
            { name: "tagline", label: t("fields.neighborhoods.tagline") },
            { name: "description", label: t("fields.neighborhoods.description"), type: "textarea" },
            { name: "atmosphere", label: t("fields.neighborhoods.atmosphere") },
            { name: "vibeTags", label: t("fields.neighborhoods.vibeTags"), getValue: (i) => (i.vibeTags || []).join(", ") },
            { name: "lat", label: t("fields.neighborhoods.lat"), type: "number", getValue: (i) => i.center?.lat },
            { name: "lng", label: t("fields.neighborhoods.lng"), type: "number", getValue: (i) => i.center?.lng },
          ]}
          emptyValues={{ name: "", city: "", tagline: "", description: "", atmosphere: "", vibeTags: "", lat: "", lng: "" }}
          transformPayload={(payload) => ({
            name: payload.name,
            city: payload.city,
            tagline: payload.tagline,
            description: payload.description,
            atmosphere: payload.atmosphere,
            vibeTags: payload.vibeTags ? payload.vibeTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
            center: { lat: Number(payload.lat) || 37.5, lng: Number(payload.lng) || 127 },
          })}
        />
      )}
    </div>
  );
}
