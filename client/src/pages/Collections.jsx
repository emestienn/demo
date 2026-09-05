import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderHeart, Plus, Lock, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { collectionsApi } from "../api/social.js";
import { PageLoader, Spinner } from "../components/ui/Loading.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { toast } from "../stores/toastStore.js";
import { getApiErrorMessage } from "../api/client.js";

export default function Collections() {
  const { t } = useTranslation(["profile", "common"]);
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", isPublic: false });
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["collections", "mine"], queryFn: collectionsApi.listMine });

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await collectionsApi.create(form);
      queryClient.invalidateQueries({ queryKey: ["collections", "mine"] });
      setForm({ name: "", description: "", isPublic: false });
      setCreating(false);
      toast(t("profile:collectionsPage.createdToast"), "success");
    } catch (err) {
      toast(getApiErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <PageLoader />;

  return (
    <div className="container-page py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-neon-cyan mb-2">{t("profile:collectionsPage.eyebrow")}</p>
          <h1 className="font-display text-4xl text-bone-50">{t("common:nav.collections")}</h1>
        </div>
        <button onClick={() => setCreating((v) => !v)} className="btn-primary">
          <Plus size={15} /> {t("profile:collectionsPage.newCollection")}
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="card-surface p-5 mb-8 space-y-3 max-w-md">
          <input
            required
            className="input-field"
            placeholder={t("profile:collectionsPage.namePlaceholder")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder={t("profile:collectionsPage.descriptionPlaceholder")}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm text-bone-200/70">
            <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
            {t("profile:collectionsPage.makePublic")}
          </label>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Spinner size={14} /> : t("common:actions.create")}
          </button>
        </form>
      )}

      {data?.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((c) => (
            <Link key={c._id} to={`/collections/${c._id}`} className="card-surface p-5 hover:border-neon-cyan/40 transition">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-lg text-bone-50">{c.name}</h3>
                {c.isPublic ? <Globe size={14} className="text-neon-cyan" /> : <Lock size={14} className="text-bone-200/40" />}
              </div>
              <p className="text-sm text-bone-200/50 line-clamp-2 mb-3">{c.description || t("profile:collectionsPage.noDescription")}</p>
              <p className="text-xs text-bone-200/40">{t("profile:collectionsPage.itemsCount", { count: c.items.length })}</p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon={FolderHeart} title={t("profile:collectionsPage.emptyTitle")} description={t("profile:collectionsPage.emptyDescription")} />
      )}
    </div>
  );
}
