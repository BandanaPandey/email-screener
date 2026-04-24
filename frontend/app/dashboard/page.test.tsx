import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";
import { ApiError } from "@/lib/api";
import type { Email } from "@/lib/types";
import { describe, expect, it, vi, beforeEach } from "vitest";

const apiMocks = vi.hoisted(() => ({
  fetchSession: vi.fn(),
  fetchEmails: vi.fn(),
  syncEmails: vi.fn(),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    fetchSession: apiMocks.fetchSession,
    fetchEmails: apiMocks.fetchEmails,
    syncEmails: apiMocks.syncEmails,
  };
});

const emailFixture: Email = {
  id: 1,
  subject: "Board update",
  sender: "ceo@example.com",
  body: "Please share the latest numbers.",
  received_at: "2026-04-24T10:00:00Z",
  provider: "google",
  email_insight: {
    category: "action_required",
    confidence: 0.9,
    reasoning: "Needs review",
    priority_score: 96,
    priority_reason: "High priority",
    summary: "Board update requested.",
    reply_suggestion: null,
  },
  tasks: [],
};

describe("DashboardPage", () => {
  beforeEach(() => {
    apiMocks.fetchSession.mockReset();
    apiMocks.fetchEmails.mockReset();
    apiMocks.syncEmails.mockReset();
  });

  it("shows auth required state for unauthenticated users", async () => {
    apiMocks.fetchSession.mockRejectedValue(new ApiError(401));

    render(<DashboardPage />);

    expect(await screen.findByText("Sign in to view your inbox")).toBeInTheDocument();
  });

  it("shows the inbox empty state when there are no emails", async () => {
    apiMocks.fetchSession.mockResolvedValue({
      authenticated: true,
      user: { id: 1, email: "user@example.com" },
    });
    apiMocks.fetchEmails.mockResolvedValue({ items: [] });

    render(<DashboardPage />);

    expect(await screen.findByText("Inbox is empty")).toBeInTheDocument();
  });

  it("shows sync success feedback after a successful refresh", async () => {
    apiMocks.fetchSession.mockResolvedValue({
      authenticated: true,
      user: { id: 1, email: "user@example.com" },
    });
    apiMocks.fetchEmails
      .mockResolvedValueOnce({ items: [] })
      .mockResolvedValueOnce({ items: [] });
    apiMocks.syncEmails.mockResolvedValue({ message: "Email sync queued" });

    render(<DashboardPage />);

    const syncButton = await screen.findByRole("button", { name: "Sync" });
    fireEvent.click(syncButton);

    expect(await screen.findByText("Inbox sync queued and refreshed.")).toBeInTheDocument();
  });

  it("shows sync failure feedback when syncing fails", async () => {
    apiMocks.fetchSession.mockResolvedValue({
      authenticated: true,
      user: { id: 1, email: "user@example.com" },
    });
    apiMocks.fetchEmails.mockResolvedValue({ items: [] });
    apiMocks.syncEmails.mockRejectedValue(new Error("sync failed"));

    render(<DashboardPage />);

    const syncButton = await screen.findByRole("button", { name: "Sync" });
    fireEvent.click(syncButton);

    expect(await screen.findByText("Inbox sync failed. Please try again.")).toBeInTheDocument();
  });

  it("renders selected email details after clicking an email", async () => {
    apiMocks.fetchSession.mockResolvedValue({
      authenticated: true,
      user: { id: 1, email: "user@example.com" },
    });
    apiMocks.fetchEmails.mockResolvedValue({ items: [emailFixture] });

    render(<DashboardPage />);

    const emailCard = await screen.findByText("Board update");
    fireEvent.click(emailCard);

    await waitFor(() => {
      expect(screen.getByText("Please share the latest numbers.")).toBeInTheDocument();
    });
  });
});
