import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { adminApi } from "../../api/social.js";
import { useAuthStore } from "../../stores/authStore.js";
import { Avatar } from "../../components/ui/Bits.jsx";
import { PageLoader } from "../../components/ui/Loading.jsx";
import { toast } from "../../stores/toastStore.js";
import { useDebouncedValue } from "../../hooks/useDebouncedValue.js";

export default function AdminUsers() {
  const { t } = useTranslation("admin");
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", debouncedSearch],
    queryFn: () => adminApi.listUsers({ search: debouncedSearch || undefined, limit: 50 }),
  });

  async function handleRoleChange(id, role) {
    await adminApi.updateUserRole(id, role);
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    toast(t("users.toast.roleUpdated"), "success");
  }

  async function handleSuspend(id, isSuspended) {
    await adminApi.setUserSuspended(id, isSuspended);
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    toast(isSuspended ? t("users.toast.userSuspended") : t("users.toast.userReinstated"), "success");
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-bone-50 mb-6">{t("users.title")}</h1>

      <div className="relative mb-6 max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bone-200/40" />
        <input className="input-field !pl-10" placeholder={t("users.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-bone-200/50 border-b border-ink-800">
                <th className="px-4 py-3 font-medium">{t("users.columns.user")}</th>
                <th className="px-4 py-3 font-medium">{t("users.columns.email")}</th>
                <th className="px-4 py-3 font-medium">{t("users.columns.role")}</th>
                <th className="px-4 py-3 font-medium">{t("users.columns.status")}</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((u) => (
                <tr key={u._id} className="border-b border-ink-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={u.avatarUrl} name={u.displayName} size={28} />
                      <span className="text-bone-100">{u.displayName || u.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-bone-200/60">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={u._id === currentUser?.id}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="input-field !w-auto !py-1.5 !text-xs"
                    >
                      <option value="user">{t("users.roles.user")}</option>
                      <option value="moderator">{t("users.roles.moderator")}</option>
                      <option value="admin">{t("users.roles.admin")}</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${u.isSuspended ? "text-neon-pink" : "text-neon-cyan"}`}>
                      {u.isSuspended ? t("users.status.suspended") : t("users.status.active")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      disabled={u._id === currentUser?.id}
                      onClick={() => handleSuspend(u._id, !u.isSuspended)}
                      className="text-xs text-bone-200/60 hover:text-neon-pink disabled:opacity-30"
                    >
                      {u.isSuspended ? t("users.reinstate") : t("users.suspend")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
