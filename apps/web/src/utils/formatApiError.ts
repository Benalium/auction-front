/**
 * Converts API error body (string or object) to a user-readable message.
 * Handles Django REST Framework formats: { detail }, { field: ["error"] }.
 */
export function formatApiError(body: unknown): string {
  if (body == null) return "Произошла ошибка";
  if (typeof body === "string") return body;
  if (typeof body !== "object") return String(body);

  const obj = body as Record<string, unknown>;

  // DRF: { detail: "message" } or { detail: ["msg1", "msg2"] }
  if ("detail" in obj) {
    const d = obj.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) return d.map(String).join(". ");
    if (typeof d === "object" && d != null) return JSON.stringify(d);
  }

  // Field-level errors: { username: ["error"], email: ["error"] }
  const entries = Object.entries(obj)
    .filter(([, v]) => v != null)
    .flatMap(([field, value]) => {
      const msgs = Array.isArray(value) ? value : [value];
      return msgs.map((m) => (field !== "detail" ? `${field}: ${m}` : String(m)));
    });

  if (entries.length > 0) return entries.join(". ");
  return JSON.stringify(obj);
}
