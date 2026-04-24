import { fireEvent, render, screen } from "@testing-library/react";
import RulesPage from "@/app/rules/page";
import { ApiError } from "@/lib/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
  fetchSession: vi.fn(),
  fetchRules: vi.fn(),
  createRule: vi.fn(),
  deleteRule: vi.fn(),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    fetchSession: apiMocks.fetchSession,
    fetchRules: apiMocks.fetchRules,
    createRule: apiMocks.createRule,
    deleteRule: apiMocks.deleteRule,
  };
});

describe("RulesPage", () => {
  beforeEach(() => {
    apiMocks.fetchSession.mockReset();
    apiMocks.fetchRules.mockReset();
    apiMocks.createRule.mockReset();
    apiMocks.deleteRule.mockReset();
  });

  it("shows auth required state for unauthorized users", async () => {
    apiMocks.fetchSession.mockRejectedValue(new ApiError(401));

    render(<RulesPage />);

    expect(await screen.findByText("Sign in to manage rules")).toBeInTheDocument();
  });

  it("shows the empty state when there are no rules", async () => {
    apiMocks.fetchSession.mockResolvedValue({
      authenticated: true,
      user: { id: 1, email: "user@example.com" },
    });
    apiMocks.fetchRules.mockResolvedValue({ items: [] });

    render(<RulesPage />);

    expect(await screen.findByText("No rules yet")).toBeInTheDocument();
  });

  it("creates a rule and shows success feedback", async () => {
    apiMocks.fetchSession.mockResolvedValue({
      authenticated: true,
      user: { id: 1, email: "user@example.com" },
    });
    apiMocks.fetchRules
      .mockResolvedValueOnce({ items: [] })
      .mockResolvedValueOnce({
        items: [
          {
            id: 1,
            field: "subject",
            operator: "contains",
            value: "invoice",
            action: "mark_action_required",
          },
        ],
      });
    apiMocks.createRule.mockResolvedValue({
      rule: {
        id: 1,
        field: "subject",
        operator: "contains",
        value: "invoice",
        action: "mark_action_required",
      },
    });

    render(<RulesPage />);

    fireEvent.change(await screen.findByPlaceholderText("Value (e.g. invoice)"), {
      target: { value: "invoice" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Rule created.")).toBeInTheDocument();
  });

  it("shows an inline error when deleting a rule fails", async () => {
    apiMocks.fetchSession.mockResolvedValue({
      authenticated: true,
      user: { id: 1, email: "user@example.com" },
    });
    apiMocks.fetchRules.mockResolvedValue({
      items: [
        {
          id: 5,
          field: "sender",
          operator: "contains",
          value: "vip",
          action: "mark_important",
        },
      ],
    });
    apiMocks.deleteRule.mockRejectedValue(new Error("delete failed"));

    render(<RulesPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));

    expect(await screen.findByText("Rule deletion failed. Please try again.")).toBeInTheDocument();
  });
});
