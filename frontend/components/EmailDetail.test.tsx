import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EmailDetail from "@/components/EmailDetail";
import type { Email } from "@/lib/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
  updateTaskStatus: vi.fn(),
  fetchAiReply: vi.fn(),
  fetchAiSummary: vi.fn(),
  extractTasks: vi.fn(),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    updateTaskStatus: apiMocks.updateTaskStatus,
    fetchAiReply: apiMocks.fetchAiReply,
    fetchAiSummary: apiMocks.fetchAiSummary,
    extractTasks: apiMocks.extractTasks,
  };
});

const emailFixture: Email = {
  id: 4,
  subject: "Client follow-up",
  sender: "client@example.com",
  body: "Can you send the revised proposal?",
  received_at: "2026-04-24T10:00:00Z",
  provider: "google",
  email_insight: {
    category: "action_required",
    confidence: 0.9,
    reasoning: "Follow-up requested",
    priority_score: 88,
    priority_reason: "High priority",
    summary: "Client wants the revised proposal.",
    reply_suggestion: null,
  },
  tasks: [
    {
      id: 11,
      title: "Send revised proposal",
      due_date: "2026-04-25",
      priority: "high",
      status: "pending",
    },
  ],
};

describe("EmailDetail", () => {
  beforeEach(() => {
    apiMocks.updateTaskStatus.mockReset();
    apiMocks.fetchAiReply.mockReset();
    apiMocks.fetchAiSummary.mockReset();
    apiMocks.extractTasks.mockReset();
  });

  it("renders a generated reply suggestion", async () => {
    apiMocks.fetchAiReply.mockResolvedValue({
      reply: "Thanks, I will send the revised proposal shortly.",
    });

    render(<EmailDetail email={emailFixture} />);

    fireEvent.click(screen.getByRole("button", { name: "✨ Reply" }));

    expect(await screen.findByDisplayValue("Thanks, I will send the revised proposal shortly.")).toBeInTheDocument();
  });

  it("renders a generated summary", async () => {
    apiMocks.fetchAiSummary.mockResolvedValue({
      summary: "The client asked for the revised proposal.",
    });

    render(<EmailDetail email={emailFixture} />);

    fireEvent.click(screen.getByRole("button", { name: "🧠 Summarize" }));

    expect(await screen.findByText("The client asked for the revised proposal.")).toBeInTheDocument();
  });

  it("replaces the task list with extracted tasks", async () => {
    apiMocks.extractTasks.mockResolvedValue({
      tasks: [
        {
          title: "Draft new proposal",
          due_date: "2026-04-26",
          priority: "medium",
        },
      ],
    });

    render(<EmailDetail email={emailFixture} />);

    fireEvent.click(screen.getByRole("button", { name: "📌 Extract Tasks" }));

    expect(await screen.findByText("Draft new proposal")).toBeInTheDocument();
    expect(screen.queryByText("Send revised proposal")).not.toBeInTheDocument();
  });

  it("rolls back the task checkbox when an update fails", async () => {
    apiMocks.updateTaskStatus.mockRejectedValue(new Error("update failed"));

    render(<EmailDetail email={emailFixture} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    await screen.findByText("Task update failed. Please try again.");
    await waitFor(() => {
      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });
  });

  it("shows the no-tasks empty state when the email has no tasks", () => {
    render(
      <EmailDetail
        email={{
          ...emailFixture,
          tasks: [],
        }}
      />
    );

    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
  });
});
