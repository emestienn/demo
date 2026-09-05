import { useTranslation } from "react-i18next";
import ResourceManager from "../../components/admin/ResourceManager.jsx";
import { cultureApi, adminCrud } from "../../api/content.js";
import { CULTURE_TYPES } from "../../constants/categories.js";

const cultureAdmin = adminCrud("/culture");

export default function AdminCulture() {
  const { t } = useTranslation("admin");
  return (
    <ResourceManager
      title={t("resources.culture.title")}
      singular={t("resources.culture.singular")}
      queryKey={["admin-culture"]}
      listFn={cultureApi.list}
      createFn={cultureAdmin.create}
      updateFn={cultureAdmin.update}
      deleteFn={cultureAdmin.remove}
      columns={[
        { key: "title", label: t("fields.culture.title") },
        { key: "type", label: t("fields.culture.type") },
        { key: "popularityScore", label: t("fields.culture.popularity") },
      ]}
      fields={[
        { name: "title", label: t("fields.culture.title"), required: true },
        { name: "type", label: t("fields.culture.type"), type: "select", options: CULTURE_TYPES.map((c) => ({ value: c, label: c })), required: true },
        { name: "summary", label: t("fields.culture.summary"), type: "textarea" },
        { name: "body", label: t("fields.culture.body"), type: "textarea" },
        { name: "tags", label: t("fields.culture.tags"), getValue: (i) => (i.tags || []).join(", ") },
        { name: "images", label: t("fields.culture.image"), getValue: (i) => i.images?.[0] || "" },
        { name: "featured", label: t("fields.culture.featured"), type: "checkbox" },
      ]}
      emptyValues={{ title: "", type: "", summary: "", body: "", tags: "", images: "", featured: false }}
      transformPayload={(payload) => ({
        ...payload,
        tags: payload.tags ? payload.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        images: payload.images ? [payload.images] : [],
      })}
    />
  );
}
