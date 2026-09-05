import { useTranslation } from "react-i18next";
import ResourceManager from "../../components/admin/ResourceManager.jsx";
import { foodApi, adminCrud } from "../../api/content.js";
import { FOOD_CATEGORIES } from "../../constants/categories.js";

const foodAdmin = adminCrud("/food");

export default function AdminFood() {
  const { t } = useTranslation("admin");
  return (
    <ResourceManager
      title={t("resources.food.title")}
      singular={t("resources.food.singular")}
      queryKey={["admin-food"]}
      listFn={foodApi.list}
      createFn={foodAdmin.create}
      updateFn={foodAdmin.update}
      deleteFn={foodAdmin.remove}
      columns={[
        { key: "nameEnglish", label: t("fields.food.name") },
        { key: "category", label: t("fields.food.category") },
        { key: "spiceLevel", label: t("fields.food.spice") },
        { key: "rating", label: t("fields.food.rating") },
      ]}
      fields={[
        { name: "nameEnglish", label: t("fields.food.nameEnglish"), required: true },
        { name: "nameKorean", label: t("fields.food.nameKorean"), required: true },
        { name: "category", label: t("fields.food.category"), type: "select", options: FOOD_CATEGORIES.map((c) => ({ value: c, label: c })), required: true },
        { name: "description", label: t("fields.food.description"), type: "textarea" },
        { name: "origin", label: t("fields.food.origin") },
        { name: "region", label: t("fields.food.region") },
        { name: "priceRange", label: t("fields.food.priceRange") },
        { name: "spiceLevel", label: t("fields.food.spiceLevel"), type: "number" },
        { name: "images", label: t("fields.food.image"), getValue: (i) => i.images?.[0] || "" },
      ]}
      emptyValues={{ nameEnglish: "", nameKorean: "", category: "", description: "", origin: "", region: "", priceRange: "", spiceLevel: 0, images: "" }}
      transformPayload={(payload) => ({
        ...payload,
        spiceLevel: Number(payload.spiceLevel) || 0,
        images: payload.images ? [payload.images] : [],
      })}
    />
  );
}
