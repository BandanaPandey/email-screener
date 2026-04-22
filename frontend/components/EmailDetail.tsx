"use client";

import { useState, useEffect } from "react";
import {
  extractTasks as extractTasksRequest,
  fetchAiReply,
  fetchAiSummary,
  updateTaskStatus,
} from "@/lib/api";

export default function EmailDetail({ email }: any) {
  const [tasks, setTasks] = useState(email.tasks || []);
  const [reply, setReply] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  // 🔥 NEW: tone state
  const [tone, setTone] = useState("professional");

  // ✅ FIX: reset state when email changes
  useEffect(() => {
    setReply("");
    setSummary("");
    setTasks(email.tasks || []);
    setError("");
    setTone("professional"); // reset tone
  }, [email.id]);

  const toggleTask = async (taskId: number, status: string) => {
    const newStatus = status === "completed" ? "pending" : "completed";

    // Optimistic UI
    setTasks((prev: any[]) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );

    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error("Task update failed", err);
    }
  };

  const callAI = async (type: string) => {
    setLoading(type);
    setError("");

    try {
      if (type === "reply") {
        const data = await fetchAiReply(email.id, tone);
        setReply(data.reply || "");
      } else if (type === "summarize") {
        const data = await fetchAiSummary(email.id, tone);
        setSummary(data.summary || "");
      } else {
        const data = await extractTasksRequest(email.id, tone);
        if (Array.isArray(data.tasks)) {
          setTasks(data.tasks);
        }
      }
    } catch (err) {
      console.error("AI error", err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(null);
    }
  };

  const insight = email.email_insight;

  return (
    <div>
      {/* SUBJECT */}
      <h2 className="text-2xl font-bold mb-2">{email.subject}</h2>

      {/* META */}
      <p className="text-sm text-gray-500 mb-4">
        From: {email.sender}
      </p>

      {/* ERROR */}
      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-600 rounded">
          {error}
        </div>
      )}

      {/* EXISTING SUMMARY */}
      {insight?.summary && !summary && (
        <div className="p-4 mb-4 bg-blue-50 rounded border">
          <h3 className="font-semibold mb-1">TL;DR</h3>
          <p>{insight.summary}</p>
        </div>
      )}

      {/* AI SUMMARY */}
      {summary && (
        <div className="p-4 mb-4 bg-indigo-50 rounded border">
          <h3 className="font-semibold mb-1">AI Summary</h3>
          <p>{summary}</p>
        </div>
      )}

      {/* TASKS */}
      {tasks.length > 0 && (
        <div className="p-4 mb-4 bg-green-50 rounded border">
          <h3 className="font-semibold mb-2">Tasks</h3>

          <ul className="space-y-2">
            {tasks.map((task: any) => (
              <li
                key={task.id}
                className="flex justify-between items-center bg-white p-2 rounded border"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={task.status === "completed"}
                    onChange={() =>
                      toggleTask(task.id, task.status)
                    }
                  />

                  <div>
                    <p
                      className={`font-medium ${
                        task.status === "completed"
                          ? "line-through text-gray-400"
                          : ""
                      }`}
                    >
                      {task.title}
                    </p>

                    {task.due_date && (
                      <p className="text-xs text-gray-500">
                        Due:{" "}
                        {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

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
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* INSIGHTS */}
      {insight && (
        <div className="p-4 mb-4 bg-gray-100 rounded border">
          <p>
            <strong>Category:</strong> {insight.category}
          </p>
          <p>
            <strong>Priority Score:</strong>{" "}
            {insight.priority_score}
          </p>
        </div>
      )}

      {/* 🎯 TONE SELECTOR */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1">Reply Tone</p>

        <div className="flex gap-2 flex-wrap">
          {["casual", "professional", "short", "detailed"].map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-2 py-1 text-sm rounded border ${
                tone === t
                  ? "bg-black text-white"
                  : "bg-gray-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 🤖 AI ACTIONS */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => callAI("reply")}
          disabled={loading !== null}
          className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          {loading === "reply" ? "Thinking..." : "✨ Reply"}
        </button>

        <button
          onClick={() => callAI("summarize")}
          disabled={loading !== null}
          className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          {loading === "summarize" ? "Summarizing..." : "🧠 Summarize"}
        </button>

        <button
          onClick={() => callAI("extract_tasks")}
          disabled={loading !== null}
          className="bg-purple-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          {loading === "extract_tasks"
            ? "Extracting..."
            : "📌 Extract Tasks"}
        </button>
      </div>

      {/* ✉️ REPLY */}
      {reply && (
        <div className="p-3 mb-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-1">
            Reply Suggestion ({tone})
          </h3>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="w-full border p-2 rounded"
            rows={6}
          />
        </div>
      )}

      {/* BODY */}
      <div className="whitespace-pre-wrap text-gray-800">
        {email.body}
      </div>
    </div>
  );
}
