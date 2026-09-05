import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore.js";

export function RequireAuth({ children }) {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export function RequireAdmin({ children }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!["admin", "moderator"].includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}
