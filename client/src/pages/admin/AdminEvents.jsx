import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import ResourceManager from "../../components/admin/ResourceManager.jsx";
import { eventsApi, citiesApi, adminCrud } from "../../api/content.js";
import { EVENT_TYPES } from "../../constants/categories.js";
import { formatDate } from "../../utils/format.js";

const eventsAdmin = adminCrud("/events");

export default function AdminEvents() {
  const { t } = useTranslation("admin");
  const { data: cities } = useQuery({ queryKey: ["all-cities"], queryFn: () => citiesApi.list() });
  const cityOptions = (cities?.data || []).map((c) => ({ value: c._id, label: c.name }));

  return (
    <ResourceManager
      title={t("resources.events.title")}
      singular={t("resources.events.singular")}
      queryKey={["admin-events"]}
      listFn={eventsApi.list}
      createFn={eventsAdmin.create}
      updateFn={eventsAdmin.update}
      deleteFn={eventsAdmin.remove}
      columns={[
        { key: "title", label: t("fields.events.title") },
        { key: "type", label: t("fields.events.type") },
        { key: "startDate", label: t("fields.events.date"), render: (i) => formatDate(i.startDate) },
        { key: "city", label: t("fields.events.city"), render: (i) => i.city?.name },
      ]}
      fields={[
        { name: "title", label: t("fields.events.title"), required: true },
        { name: "type", label: t("fields.events.type"), type: "select", options: EVENT_TYPES.map((ty) => ({ value: ty, label: ty })), required: true },
        { name: "city", label: t("fields.events.city"), type: "select", options: cityOptions, required: true },
        { name: "venueName", label: t("fields.events.venue") },
        { name: "description", label: t("fields.events.description"), type: "textarea" },
        { name: "startDate", label: t("fields.events.startDate"), type: "date", getValue: (i) => i.startDate?.slice(0, 10), required: true },
        { name: "priceRange", label: t("fields.events.priceRange") },
        { name: "images", label: t("fields.events.image"), getValue: (i) => i.images?.[0] || "" },
      ]}
      emptyValues={{ title: "", type: "", city: "", venueName: "", description: "", startDate: "", priceRange: "", images: "" }}
      transformPayload={(payload) => ({
        ...payload,
        startDate: new Date(payload.startDate),
        images: payload.images ? [payload.images] : [],
      })}
    />
  );
}
