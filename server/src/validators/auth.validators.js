import { validateBody } from "./validate.js";

export const validateRegister = validateBody({
  username: { required: true, type: "string", minLength: 3, maxLength: 24, pattern: /^[a-zA-Z0-9_.]+$/ },
  email: { required: true, type: "string", pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { required: true, type: "string", minLength: 8 },
});

export const validateLogin = validateBody({
  email: { required: true, type: "string" },
  password: { required: true, type: "string" },
});
