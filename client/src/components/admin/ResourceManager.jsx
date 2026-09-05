import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "../../stores/toastStore.js";
import { getApiErrorMessage } from "../../api/client.js";
import { PageLoader, Spinner } from "../ui/Loading.jsx";

export default function ResourceManager({ title, singular, queryKey, listFn, createFn, updateFn, deleteFn, columns, fields, emptyValues, transformPayload }) {
  const { t } = useTranslation(["admin", "common"]);
  const singularLabel = singular || title.toLowerCase().replace(/s$/, "");
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState(emptyValues);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({ queryKey, queryFn: () => listFn({ limit: 100 }) });
  const items = data?.data || [];

  function openCreate() {
    setEditing(null);
    setValues(emptyValues);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    const next = { ...emptyValues };
    for (const f of fields) next[f.name] = f.getValue ? f.getValue(item) : item[f.name] ?? emptyValues[f.name];
    setValues(next);
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      let payload = {};
      for (const f of fields) {
        payload[f.name] = f.parse ? f.parse(values[f.name]) : values[f.name];
      }
      if (transformPayload) payload = transformPayload(payload, values);
      if (editing) {
        await updateFn(editing._id, payload);
        toast(t("admin:resourceManager.updated", { resource: title }), "success");
      } else {
        await createFn(payload);
        toast(t("admin:resourceManager.created", { resource: title }), "success");
      }
      queryClient.invalidateQueries({ queryKey });
      setModalOpen(false);
    } catch (err) {
      toast(getApiErrorMessage(err, t("admin:resourceManager.saveError", { resource: singularLabel })), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(t("admin:resourceManager.deleteConfirm", { resource: singularLabel }))) return;
    try {
      await deleteFn(item._id);
      queryClient.invalidateQueries({ queryKey });
      toast(t("admin:resourceManager.deleted", { resource: title }), "success");
    } catch (err) {
      toast(getApiErrorMessage(err), "error");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-bone-50">{title}</h1>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} /> {t("admin:resourceManager.new", { resource: singularLabel })}
        </button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-bone-200/50 border-b border-ink-800">
                {columns.map((c) => (
                  <th key={c.key} className="px-4 py-3 font-medium whitespace-nowrap">{c.label}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b border-ink-800/50">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-bone-100 max-w-[220px] truncate">
                      {c.render ? c.render(item) : item[c.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(item)} className="text-bone-200/50 hover:text-neon-cyan mr-3">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(item)} className="text-bone-200/50 hover:text-neon-pink">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-bone-200/40">
                    {t("admin:resourceManager.empty", { resource: title.toLowerCase() })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink-950/70 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="card-surface w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg text-bone-50">
                {editing
                  ? t("admin:resourceManager.edit", { resource: singularLabel })
                  : t("admin:resourceManager.new", { resource: singularLabel })}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-bone-200/50 hover:text-bone-50">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((f) => (
                <div key={f.name}>
                  <label className="block text-xs font-medium text-bone-200/60 mb-1.5">{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      className="input-field resize-none"
                      rows={3}
                      value={values[f.name] ?? ""}
                      onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                      required={f.required}
                    />
                  ) : f.type === "select" ? (
                    <select
                      className="input-field"
                      value={values[f.name] ?? ""}
                      onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                      required={f.required}
                    >
                      <option value="">{t("admin:resourceManager.selectOption")}</option>
                      {f.options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : f.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={Boolean(values[f.name])}
                      onChange={(e) => setValues({ ...values, [f.name]: e.target.checked })}
                    />
                  ) : (
                    <input
                      type={f.type || "text"}
                      className="input-field"
                      value={values[f.name] ?? ""}
                      onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                      required={f.required}
                    />
                  )}
                  {f.hint && <p className="text-[11px] text-bone-200/40 mt-1">{f.hint}</p>}
                </div>
              ))}
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full mt-6">
              {saving ? <Spinner size={16} /> : editing ? t("common:actions.saveChanges") : t("common:actions.create")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
