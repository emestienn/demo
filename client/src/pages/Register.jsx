import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../stores/authStore.js";
import { getApiErrorMessage } from "../api/client.js";
import { toast } from "../stores/toastStore.js";
import { Spinner } from "../components/ui/Loading.jsx";

export default function Register() {
  const { t } = useTranslation("auth");
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      toast(t("register.successToast"), "success");
      navigate("/discover", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, t("register.errorDefault")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-bone-50 mb-1.5">{t("register.title")}</h1>
      <p className="text-sm text-bone-200/60 mb-8">{t("register.subtitle")}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-bone-200/60 mb-1.5">{t("register.usernameLabel")}</label>
          <input
            required
            minLength={3}
            className="input-field"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder={t("register.usernamePlaceholder")}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-bone-200/60 mb-1.5">{t("register.emailLabel")}</label>
          <input
            type="email"
            required
            className="input-field"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder={t("register.emailPlaceholder")}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-bone-200/60 mb-1.5">{t("register.passwordLabel")}</label>
          <input
            type="password"
            required
            minLength={8}
            className="input-field"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={t("register.passwordPlaceholder")}
          />
        </div>

        {error && <p className="text-sm text-neon-pink">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
          {loading ? <Spinner size={16} /> : t("register.submit")}
        </button>
      </form>

      <p className="mt-6 text-sm text-bone-200/60 text-center">
        {t("register.alreadyHaveAccount")}{" "}
        <Link to="/login" className="text-neon-cyan font-medium">
          {t("register.logIn")}
        </Link>
      </p>
    </div>
  );
}
