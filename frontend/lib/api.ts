const FALLBACK_API_BASE_URL = "http://localhost:3000";
const FALLBACK_APP_URL = "http://localhost:3001";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || FALLBACK_API_BASE_URL;

export const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || FALLBACK_APP_URL;

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}
