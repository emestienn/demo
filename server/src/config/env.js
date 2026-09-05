import dotenv from "dotenv";

dotenv.config();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 4000,
  CLIENT_ORIGIN,
  // CLIENT_ORIGIN may be a comma-separated list (e.g. a production domain plus
  // Vercel preview URLs) — CLIENT_ORIGINS is the parsed array used by CORS/socket.io.
  CLIENT_ORIGINS: CLIENT_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean),
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dongne",
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
};
