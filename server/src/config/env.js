import dotenv from "dotenv";

dotenv.config();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
// CLIENT_ORIGIN may be a comma-separated list (e.g. a production domain plus
// another allowed origin) — CLIENT_ORIGINS is the parsed array.
const CLIENT_ORIGINS = CLIENT_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean);

// Vercel mints a brand-new host for every deployment (e.g.
// https://dongne-<hash>-<team>.vercel.app, https://dongne-git-<branch>-<team>.vercel.app)
// alongside the stable production alias (https://dongne.vercel.app). Pinning
// CLIENT_ORIGIN to just the production alias would reject every other
// deployment/preview link for the same project, so any configured *.vercel.app
// origin also implicitly allows sibling deployment URLs sharing its project slug.
const vercelProjectPatterns = CLIENT_ORIGINS.map((origin) => {
  try {
    const { hostname } = new URL(origin);
    if (!hostname.endsWith(".vercel.app")) return null;
    const projectSlug = hostname.split(".")[0].split("-")[0];
    return new RegExp(`^https://${projectSlug}(-[a-zA-Z0-9-]+)?\\.vercel\\.app$`);
  } catch {
    return null;
  }
}).filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true; // non-browser requests (curl, server-to-server) send no Origin header
  if (CLIENT_ORIGINS.includes(origin)) return true;
  return vercelProjectPatterns.some((pattern) => pattern.test(origin));
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 4000,
  CLIENT_ORIGIN,
  CLIENT_ORIGINS,
  isAllowedOrigin,
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dongne",
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
};
