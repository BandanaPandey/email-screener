import {
  ApiError,
  API_BASE_URL,
  deleteRule,
  fetchEmails,
  fetchSession,
  googleAuthUrl,
  updateTaskStatus,
} from "@/lib/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("api client", () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockReset();
  });

  it("builds the google auth url from the configured api base url", () => {
    expect(googleAuthUrl()).toBe(`${API_BASE_URL}/auth/google_oauth2`);
  });

  it("includes credentials for session requests", async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify({
        authenticated: true,
        user: { id: 1, email: "user@example.com" },
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await fetchSession();

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/session`,
      expect.objectContaining({
        credentials: "include",
      })
    );
  });

  it("serializes object bodies for json requests", async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify({
        task: {
          id: 10,
          title: "Follow up",
          due_date: null,
          priority: "high",
          status: "completed",
        },
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await updateTaskStatus(10, "completed");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/tasks/10`,
      expect.objectContaining({
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({
          task: { status: "completed" },
        }),
        headers: expect.any(Headers),
      })
    );

    const requestHeaders = vi.mocked(global.fetch).mock.calls[0]?.[1]
      ?.headers as Headers;
    expect(requestHeaders.get("Content-Type")).toBe("application/json");
  });

  it("throws ApiError for unauthorized responses", async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    );

    await expect(fetchEmails()).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: "ApiError",
        status: 401,
      })
    );
  });

  it("returns parsed data for collection responses", async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify({
        items: [
          {
            id: 1,
            subject: "Hello",
            sender: "boss@example.com",
            body: "Please respond",
            received_at: "2026-04-24T10:00:00Z",
            provider: "google",
            email_insight: null,
            tasks: [],
          },
        ],
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const response = await fetchEmails();

    expect(response.items).toHaveLength(1);
    expect(response.items[0]?.subject).toBe("Hello");
  });

  it("returns undefined for 204 delete responses", async () => {
    vi.mocked(global.fetch).mockResolvedValue(new Response(null, { status: 204 }));

    await expect(deleteRule(5)).resolves.toBeUndefined();

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/rules/5`,
      expect.objectContaining({
        method: "DELETE",
        credentials: "include",
      })
    );
  });
});
