import { useState } from "react";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { usersApi } from "../../api/social.js";
import { useAuthStore } from "../../stores/authStore.js";
import { toast } from "../../stores/toastStore.js";
import { getApiErrorMessage } from "../../api/client.js";
import { Spinner } from "../ui/Loading.jsx";
import { Avatar } from "../ui/Bits.jsx";

export default function EditProfileModal({ profile, onClose }) {
  const { t } = useTranslation(["profile", "common"]);
  const updateLocalUser = useAuthStore((s) => s.updateLocalUser);
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    displayName: profile.displayName || "",
    bio: profile.bio || "",
    interests: (profile.interests || []).join(", "),
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        const updated = await usersApi.uploadAvatar(formData);
        updateLocalUser({ avatarUrl: updated.avatarUrl });
      }
      const updated = await usersApi.updateMe({
        displayName: form.displayName,
        bio: form.bio,
        interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
      });
      updateLocalUser(updated);
      queryClient.invalidateQueries({ queryKey: ["profile", profile.username] });
      toast(t("profile:toasts.profileUpdated"), "success");
      onClose();
    } catch (err) {
      toast(getApiErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink-950/70 backdrop-blur-sm p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} className="card-surface w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg text-bone-50">{t("common:nav.editProfile")}</h3>
          <button type="button" onClick={onClose} className="text-bone-200/50 hover:text-bone-50">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <Avatar src={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatarUrl} name={profile.displayName} size={56} />
          <label className="btn-ghost !py-2 !px-3 text-xs cursor-pointer">
            {t("profile:editModal.changePhoto")}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-bone-200/60 mb-1.5">{t("profile:editModal.displayName")}</label>
            <input className="input-field" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-bone-200/60 mb-1.5">{t("profile:editModal.bio")}</label>
            <textarea className="input-field resize-none" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-bone-200/60 mb-1.5">{t("profile:editModal.interests")}</label>
            <input className="input-field" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} placeholder={t("profile:editModal.interestsPlaceholder")} />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full mt-6">
          {saving ? <Spinner size={16} /> : t("common:actions.saveChanges")}
        </button>
      </form>
    </div>
  );
}
