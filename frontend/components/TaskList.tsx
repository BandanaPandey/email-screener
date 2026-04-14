"use client";

export default function TaskList({ tasks, refresh }: any) {
  const toggleTask = async (task: any) => {
    const newStatus =
      task.status === "completed" ? "pending" : "completed";

    try {
      await fetch(`http://localhost:3000/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: { status: newStatus },
        }),
      });

      refresh();
    } catch (err) {
      console.error("Task update failed", err);
    }
  };

  return (
    <div className="space-y-3">
      {tasks.map((task: any) => (
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