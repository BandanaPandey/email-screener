"use client";

import { updateTaskStatus } from "@/lib/api";
import type { Task } from "@/lib/types";

type Props = {
  tasks: Task[];
  refresh: () => Promise<void>;
};

export default function TaskList({ tasks, refresh }: Props) {
  const toggleTask = async (task: Task) => {
    const newStatus =
      task.status === "completed" ? "pending" : "completed";

    try {
      await updateTaskStatus(task.id, newStatus);

      refresh();
    } catch (err) {
      console.error("Task update failed", err);
    }
  };

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="p-4 border rounded-xl bg-white flex justify-between items-center"
        >
          <div>
            <h3
              className={`font-semibold ${
                task.status === "completed"
                  ? "line-through text-gray-400"
                  : ""
              }`}
            >
              {task.title}
            </h3>

            <p className="text-sm text-gray-500">
              {task.email?.subject}
            </p>

            {task.due_date && (
              <p className="text-xs text-gray-400">
                Due:{" "}
                {new Date(task.due_date).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* PRIORITY */}
            <span
              className={`text-xs px-2 py-1 rounded ${
                task.priority === "high"
                  ? "bg-red-500 text-white"
                  : task.priority === "medium"
                  ? "bg-yellow-400"
                  : "bg-gray-300"
              }`}
            >
              {task.priority}
            </span>

            {/* TOGGLE */}
            <input
              type="checkbox"
              checked={task.status === "completed"}
              onChange={() => toggleTask(task)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
