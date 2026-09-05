import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import ResourceManager from "../../components/admin/ResourceManager.jsx";
import { placesApi, adminCrud, neighborhoodsApi } from "../../api/content.js";
import { PLACE_CATEGORIES } from "../../constants/categories.js";

const placesAdmin = adminCrud("/places");

export default function AdminPlaces() {
  const { t } = useTranslation("admin");
  const { data: neighborhoods } = useQuery({ queryKey: ["all-neighborhoods"], queryFn: () => neighborhoodsApi.list({ limit: 100 }) });

  const neighborhoodOptions = (neighborhoods?.data || []).map((n) => ({ value: n._id, label: `${n.name} (${n.city?.name})` }));
  const neighborhoodById = Object.fromEntries((neighborhoods?.data || []).map((n) => [n._id, n]));

  return (
    <ResourceManager
      title={t("resources.places.title")}
      singular={t("resources.places.singular")}
      queryKey={["admin-places"]}
      listFn={placesApi.list}
      createFn={placesAdmin.create}
      updateFn={placesAdmin.update}
      deleteFn={placesAdmin.remove}
      columns={[
        { key: "name", label: t("fields.places.name") },
        { key: "category", label: t("fields.places.category") },
        { key: "neighborhood", label: t("fields.places.neighborhood"), render: (i) => i.neighborhood?.name },
        { key: "rating", label: t("fields.places.rating") },
      ]}
      fields={[
        { name: "name", label: t("fields.places.name"), required: true },
        { name: "neighborhood", label: t("fields.places.neighborhood"), type: "select", options: neighborhoodOptions, required: true },
        { name: "category", label: t("fields.places.category"), type: "select", options: PLACE_CATEGORIES.map((c) => ({ value: c, label: c })), required: true },
        { name: "description", label: t("fields.places.description"), type: "textarea" },
        { name: "address", label: t("fields.places.address") },
        { name: "priceLevel", label: t("fields.places.priceLevel"), type: "number" },
        { name: "tags", label: t("fields.places.tags"), getValue: (i) => (i.tags || []).join(", ") },
        { name: "lat", label: t("fields.places.lat"), type: "number", getValue: (i) => i.location?.coordinates?.[1] },
        { name: "lng", label: t("fields.places.lng"), type: "number", getValue: (i) => i.location?.coordinates?.[0] },
        { name: "images", label: t("fields.places.image"), getValue: (i) => i.images?.[0] || "" },
      ]}
      emptyValues={{ name: "", neighborhood: "", category: "", description: "", address: "", priceLevel: 2, tags: "", lat: "", lng: "", images: "" }}
      transformPayload={(payload) => {
        const neighborhood = neighborhoodById[payload.neighborhood];
        return {
          name: payload.name,
          neighborhood: payload.neighborhood,
          city: neighborhood?.city?._id || neighborhood?.city,
          category: payload.category,
          description: payload.description,
          address: payload.address,
          priceLevel: Number(payload.priceLevel) || 2,
          tags: payload.tags ? payload.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          images: payload.images ? [payload.images] : [],
          location: { type: "Point", coordinates: [Number(payload.lng) || 0, Number(payload.lat) || 0] },
        };
      }}
    />
  );
}
