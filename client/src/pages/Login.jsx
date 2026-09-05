import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../stores/authStore.js";
import { getApiErrorMessage } from "../api/client.js";
import { toast } from "../stores/toastStore.js";
import { Spinner } from "../components/ui/Loading.jsx";

export default function Login() {
  const { t } = useTranslation("auth");
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast(t("login.welcomeToast"), "success");
      navigate(location.state?.from?.pathname || "/discover", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, t("login.errorDefault")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-bone-50 mb-1.5">{t("login.title")}</h1>
      <p className="text-sm text-bone-200/60 mb-8">{t("login.subtitle")}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-bone-200/60 mb-1.5">{t("login.emailLabel")}</label>
          <input
            type="email"
            required
            className="input-field"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder={t("login.emailPlaceholder")}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-bone-200/60 mb-1.5">{t("login.passwordLabel")}</label>
          <input
            type="password"
            required
            className="input-field"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-neon-pink">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
          {loading ? <Spinner size={16} /> : t("login.submit")}
        </button>
      </form>

      <div className="mt-6 p-4 rounded-xl border border-ink-700 bg-ink-900/60 text-xs text-bone-200/50">
        {t("login.demoAccountLabel")} <span className="text-bone-100">jinwoo_seoul@dongne.app</span> / <span className="text-bone-100">password123</span>
      </div>

      <p className="mt-6 text-sm text-bone-200/60 text-center">
        {t("login.newToDongne")}{" "}
        <Link to="/register" className="text-neon-cyan font-medium">
          {t("login.createAccount")}
        </Link>
      </p>
    </div>
  );
}
