"use client";

import { useEffect, useState } from "react";
import EmailListItem from "@/components/EmailListItem";
import EmailDetail from "@/components/EmailDetail";

type Email = {
  id: number;
  subject: string;
  sender: string;
  body: string;
  received_at: string;
  email_insight?: {
    category: string;
    confidence: number;
    priority_score: number;
    priority_reason: string;
  };
};

export default function DashboardPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const res = await fetch("http://localhost:3000/emails");
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    try {
      await fetch("http://localhost:3000/sync_emails", {
        method: "POST"
      });

      alert("Sync started 🚀");
      setTimeout(fetchEmails, 3000);
    } catch (err) {
      alert("Sync failed ❌");
    }
  };

  // 🔥 Sort by priority
  const sortedEmails = [...emails].sort(
    (a, b) =>
      (b.email_insight?.priority_score || 0) -
      (a.email_insight?.priority_score || 0)
  );

  // 🔥 Apply filter
  const filteredEmails = sortedEmails.filter((email) => {
    const score = email.email_insight?.priority_score || 0;

    if (filter === "high") return score >= 80;
    if (filter === "medium") return score >= 50 && score < 80;
    if (filter === "low") return score < 50;

    return true;
  });

  return (
    <div className="flex h-screen">
      {/* LEFT PANEL */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Inbox</h2>
            <button
              onClick={triggerSync}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Sync
            </button>
          </div>

          {/* 🔥 Filters */}
          <div className="flex gap-2 mt-2">
            {["all", "high", "medium", "low"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-2 py-1 text-sm rounded ${
                  filter === f
                    ? "bg-black text-white"
                    : "bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="p-4">Loading...</p>
        ) : filteredEmails.length === 0 ? (
          <p className="p-4">No emails</p>
        ) : (
          filteredEmails.map((email) => (
            <EmailListItem
              key={email.id}
              email={email}
              onClick={() => setSelectedEmail(email)}
            />
          ))
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedEmail ? (
          <EmailDetail email={selectedEmail} />
        ) : (
          <p>Select an email</p>
        )}
      </div>
    </div>
  );
}