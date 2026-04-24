import { fireEvent, render, screen } from "@testing-library/react";
import TasksPage from "@/app/tasks/page";
import TaskList from "@/components/TaskList";
import { ApiError } from "@/lib/api";
import type { Task } from "@/lib/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
  fetchSession: vi.fn(),
  fetchTasks: vi.fn(),
  updateTaskStatus: vi.fn(),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    fetchSession: apiMocks.fetchSession,
    fetchTasks: apiMocks.fetchTasks,
    updateTaskStatus: apiMocks.updateTaskStatus,
  };
});

const taskFixture: Task = {
  id: 1,
  title: "Send draft",
  due_date: null,
  priority: "high",
  status: "pending",
  email: {
    id: 10,
    subject: "Proposal request",
  },
};

describe("TasksPage", () => {
  beforeEach(() => {
    apiMocks.fetchSession.mockReset();
    apiMocks.fetchTasks.mockReset();
    apiMocks.updateTaskStatus.mockReset();
  });

  it("shows auth required state when the session is unauthorized", async () => {
    apiMocks.fetchSession.mockRejectedValue(new ApiError(401));

    render(<TasksPage />);

    expect(await screen.findByText("Sign in to manage tasks")).toBeInTheDocument();
  });

  it("shows an empty state when no tasks match the current view", async () => {
    apiMocks.fetchSession.mockResolvedValue({
      authenticated: true,
      user: { id: 1, email: "user@example.com" },
    });
    apiMocks.fetchTasks.mockResolvedValue({
      items: [
        {
          ...taskFixture,
          status: "completed",
        },
      ],
    });

    render(<TasksPage />);

    const pendingFilter = await screen.findByRole("button", { name: "pending" });
    fireEvent.click(pendingFilter);

    expect(await screen.findByText("No tasks for this view")).toBeInTheDocument();
  });
});

describe("TaskList", () => {
  beforeEach(() => {
    apiMocks.updateTaskStatus.mockReset();
  });

  it("refreshes and shows success after a successful toggle", async () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    apiMocks.updateTaskStatus.mockResolvedValue({
      task: { ...taskFixture, status: "completed" },
    });

    render(<TaskList tasks={[taskFixture]} refresh={refresh} />);

    fireEvent.click(screen.getByRole("checkbox"));

    expect(await screen.findByText("Task status updated.")).toBeInTheDocument();
    expect(apiMocks.updateTaskStatus).toHaveBeenCalledWith(1, "completed");
    expect(refresh).toHaveBeenCalled();
  });

  it("shows an inline error when task updates fail", async () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    apiMocks.updateTaskStatus.mockRejectedValue(new Error("update failed"));

    render(<TaskList tasks={[taskFixture]} refresh={refresh} />);

    fireEvent.click(screen.getByRole("checkbox"));

    expect(await screen.findByText("Task update failed. Please try again.")).toBeInTheDocument();
    expect(refresh).not.toHaveBeenCalled();
  });
});
