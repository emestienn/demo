import { ApiError } from "../utils/ApiError.js";

export function validateBody(rules) {
  return (req, _res, next) => {
    const errors = [];
    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body[field];
      if (rule.required && (value === undefined || value === null || value === "")) {
        errors.push(`${field} is required`);
        continue;
      }
      if (value === undefined || value === null) continue;
      if (rule.type === "string" && typeof value !== "string") errors.push(`${field} must be a string`);
      if (rule.type === "number" && typeof value !== "number") errors.push(`${field} must be a number`);
      if (rule.minLength && typeof value === "string" && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }
      if (rule.maxLength && typeof value === "string" && value.length > rule.maxLength) {
        errors.push(`${field} must be at most ${rule.maxLength} characters`);
      }
      if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rule.enum.join(", ")}`);
      }
    }
    if (errors.length) throw ApiError.badRequest("Validation failed", errors);
    next();
  };
}
