import { useState } from "react";
import { X, Plus, Check } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { collectionsApi } from "../../api/social.js";
import { toast } from "../../stores/toastStore.js";
import { getApiErrorMessage } from "../../api/client.js";
import { Spinner } from "../ui/Loading.jsx";

export default function AddToCollectionModal({ itemType, itemId, onClose }) {
  const { t } = useTranslation(["profile", "common"]);
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());

  const { data: collections, isLoading } = useQuery({
    queryKey: ["collections", "mine"],
    queryFn: collectionsApi.listMine,
  });

  async function handleAdd(collectionId) {
    try {
      await collectionsApi.addItem(collectionId, { itemType, itemId });
      setAddedIds((prev) => new Set(prev).add(collectionId));
      toast(t("profile:addToCollection.addedToast"), "success");
    } catch (err) {
      toast(getApiErrorMessage(err, t("profile:addToCollection.addErrorToast")), "error");
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await collectionsApi.create({ name: newName.trim() });
      await collectionsApi.addItem(res.data._id, { itemType, itemId });
      setAddedIds((prev) => new Set(prev).add(res.data._id));
      setNewName("");
      queryClient.invalidateQueries({ queryKey: ["collections", "mine"] });
      toast(t("profile:addToCollection.createdAndAddedToast", { name: newName }), "success");
    } catch (err) {
      toast(getApiErrorMessage(err, t("profile:addToCollection.createErrorToast")), "error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink-950/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="card-surface w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-bone-50">{t("profile:addToCollection.title")}</h3>
          <button onClick={onClose} className="text-bone-200/50 hover:text-bone-50">
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto mb-4">
            {(collections || []).map((c) => (
              <button
                key={c._id}
                onClick={() => handleAdd(c._id)}
                disabled={addedIds.has(c._id)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-ink-800 text-sm text-left disabled:opacity-50"
              >
                <span className="text-bone-100">{c.name}</span>
                {addedIds.has(c._id) ? <Check size={15} className="text-neon-cyan" /> : <Plus size={15} className="text-bone-200/40" />}
              </button>
            ))}
            {!collections?.length && <p className="text-sm text-bone-200/50 px-3 py-2">{t("profile:addToCollection.noCollections")}</p>}
          </div>
        )}

        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            className="input-field flex-1"
            placeholder={t("profile:addToCollection.namePlaceholder")}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit" disabled={creating} className="btn-primary !px-4">
            {creating ? <Spinner size={14} /> : t("profile:addToCollection.add")}
          </button>
        </form>
      </div>
    </div>
  );
}
