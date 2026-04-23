import type { Email } from "@/lib/types";

export function isActionRequired(email: Email) {
  if (email.tasks.length > 0) return true;

  const summary = email.email_insight?.summary?.toLowerCase() || "";

  return (
    summary.includes("reply") ||
    summary.includes("submit") ||
    summary.includes("complete") ||
    summary.includes("schedule")
  );
}
