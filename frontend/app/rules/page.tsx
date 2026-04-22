"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

export default function RulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [form, setForm] = useState({
    field: "subject",
    operator: "contains",
    value: "",
    action: "mark_action_required",
  });

  const fetchRules = async () => {
    const res = await fetch(`${API_BASE_URL}/rules`, {
      credentials: "include",
    });
    const data = await res.json();
    setRules(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const createRule = async () => {
    if (!form.value) return;

    await fetch(`${API_BASE_URL}/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ rule: form }),
    });

    setForm({ ...form, value: "" });
    fetchRules();
  };

  const deleteRule = async (id: number) => {
    await fetch(`${API_BASE_URL}/rules/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    fetchRules();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rule Engine</h1>

      {/* CREATE RULE */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={form.field}
          onChange={(e) => setForm({ ...form, field: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="sender">Sender</option>
          <option value="subject">Subject</option>
          <option value="body">Body</option>
        </select>

        <select
          value={form.operator}
          onChange={(e) => setForm({ ...form, operator: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="contains">Contains</option>
          <option value="equals">Equals</option>
        </select>

        <input
          value={form.value}
          placeholder="Value (e.g. invoice)"
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          className="border p-2 rounded flex-1"
        />

        <select
          value={form.action}
          onChange={(e) => setForm({ ...form, action: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="mark_important">Important</option>
          <option value="mark_action_required">Action Required</option>
          <option value="mark_promotion">Promotion</option>
        </select>

        <button
          onClick={createRule}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* RULE LIST */}
      <div className="space-y-2">
        {rules.map((r) => (
          <div
            key={r.id}
            className="p-3 border rounded flex justify-between items-center"
          >
            <span className="text-sm">
              IF <b>{r.field}</b> {r.operator} "<b>{r.value}</b>" →{" "}
              <b>{r.action}</b>
            </span>

            <button
              onClick={() => deleteRule(r.id)}
              className="text-red-500 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
