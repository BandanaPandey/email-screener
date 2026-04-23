"use client";

import { useEffect, useState } from "react";
import AuthRequiredState from "@/components/AuthRequiredState";
import EmptyState from "@/components/EmptyState";
import InlineMessage from "@/components/InlineMessage";
import {
  ApiError,
  createRule as createRuleRequest,
  deleteRule as deleteRuleRequest,
  fetchSession,
  fetchRules as fetchRulesRequest,
} from "@/lib/api";
import type { Rule } from "@/lib/types";

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState({
    field: "subject",
    operator: "contains",
    value: "",
    action: "mark_action_required",
  });

  const fetchRules = async () => {
    try {
      const data = await fetchRulesRequest();
      setRules(data.items);
      setError("");
    } catch (err) {
      console.error("Failed to fetch rules", err);
      setError("We could not load your rules right now.");
    }
  };

  useEffect(() => {
    const loadSessionAndRules = async () => {
      try {
        await fetchSession();
        setIsAuthenticated(true);
        await fetchRules();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          setIsAuthenticated(false);
          return;
        }

        console.error("Session check failed", err);
      } finally {
        setLoading(false);
      }
    };

    loadSessionAndRules();
  }, []);

  const createRule = async () => {
    if (!form.value) return;

    try {
      await createRuleRequest(form);
      setForm({ ...form, value: "" });
      setSuccessMessage("Rule created.");
      setError("");
      await fetchRules();
    } catch (err) {
      console.error("Failed to create rule", err);
      setError("Rule creation failed. Please try again.");
    }
  };

  const deleteRule = async (id: number) => {
    try {
      await deleteRuleRequest(id);
      setSuccessMessage("Rule deleted.");
      setError("");
      await fetchRules();
    } catch (err) {
      console.error("Failed to delete rule", err);
      setError("Rule deletion failed. Please try again.");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!isAuthenticated) {
    return (
      <AuthRequiredState
        title="Sign in to manage rules"
        message="Connect your Gmail account to create automation rules for your inbox."
      />
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rule Engine</h1>
      {error && (
        <div className="mb-4">
          <InlineMessage message={error} tone="error" />
        </div>
      )}
      {successMessage && (
        <div className="mb-4">
          <InlineMessage message={successMessage} />
        </div>
      )}

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
      {rules.length > 0 ? (
        <div className="space-y-2">
          {rules.map((r) => (
            <div
              key={r.id}
              className="p-3 border rounded flex justify-between items-center"
            >
              <span className="text-sm">
                IF <b>{r.field}</b> {r.operator} value <b>{r.value}</b> →{" "}
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
      ) : (
        <EmptyState
          title="No rules yet"
          message="Add a rule to automatically prioritize or categorize incoming email."
        />
      )}
    </div>
  );
}
