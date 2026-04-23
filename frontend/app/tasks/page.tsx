"use client";

import { useEffect, useState } from "react";
import AuthRequiredState from "@/components/AuthRequiredState";
import EmptyState from "@/components/EmptyState";
import InlineMessage from "@/components/InlineMessage";
import TaskList from "../../components/TaskList";
import {
  ApiError,
  fetchSession,
  fetchTasks as fetchTasksRequest,
} from "@/lib/api";
import type { Task } from "@/lib/types";

type FilterType = "all" | "today" | "pending" | "completed";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      const data = await fetchTasksRequest();
      setTasks(data.items);
      setError("");
    } catch (err) {
      console.error("Failed to fetch tasks", err);
      setError("We could not load your tasks right now.");
    }
  };

  useEffect(() => {
    const loadSessionAndTasks = async () => {
      try {
        await fetchSession();
        setIsAuthenticated(true);
        await fetchTasks();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        console.error("Session check failed", err);
      } finally {
        setLoading(false);
      }
    };

    loadSessionAndTasks();
  }, []);

  const isToday = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  };

  const filteredTasks = tasks.filter((task) => {
    switch (filter) {
      case "today":
        return task.due_date && isToday(task.due_date);
      case "pending":
        return task.status === "pending";
      case "completed":
        return task.status === "completed";
      default:
        return true;
    }
  });

  if (loading) return <p className="p-6">Loading...</p>;
  if (!isAuthenticated) {
    return (
      <AuthRequiredState
        title="Sign in to manage tasks"
        message="Connect your Gmail account to load extracted tasks and update their status."
      />
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Task Dashboard</h1>
      {error && (
        <div className="mb-4">
          <InlineMessage message={error} tone="error" />
        </div>
      )}

      {/* FILTERS */}
      <div className="flex gap-2 mb-4">
        {["all", "today", "pending", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as FilterType)}
            className={`px-3 py-1 rounded ${
              filter === f ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredTasks.length > 0 ? (
        <TaskList tasks={filteredTasks} refresh={fetchTasks} />
      ) : (
        <EmptyState
          title="No tasks for this view"
          message="Try another filter or extract tasks from new emails to populate this list."
        />
      )}
    </div>
  );
}
