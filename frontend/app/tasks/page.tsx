"use client";

import { useEffect, useState } from "react";
import TaskList from "../../components/TaskList";

type FilterType = "all" | "today" | "pending" | "completed";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchTasks = async () => {
    try {
      const res = await fetch("http://localhost:3000/tasks", {
        credentials: "include", // Important for session cookies
      });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  useEffect(() => {
    fetchTasks();
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Task Dashboard</h1>

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

      <TaskList tasks={filteredTasks} refresh={fetchTasks} />
    </div>
  );
}