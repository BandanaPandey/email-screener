"use client";

import { useEffect, useState } from "react";
import EmailList from "@/components/EmailListItem";
import EmailDetail from "@/components/EmailDetail";

type FilterType =
  | "all"
  | "action"
  | "promotion"
  | "social"
  | "job";

export default function DashboardPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  // 🔹 FETCH EMAILS
  const fetchEmails = async () => {
    try {
      const res = await fetch("http://localhost:3000/emails");
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.error("Failed to fetch emails", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  // 🔥 SYNC TRIGGER
  const handleSync = async () => {
    setSyncing(true);

    try {
      await fetch("http://localhost:3000/sync_emails", {
        method: "POST"
      });

      await fetchEmails(); // refresh UI
    } catch (err) {
      console.error("Sync failed", err);
    } finally {
      setSyncing(false);
    }
  };

  // 🔥 ACTION DETECTION
  const isActionRequired = (email: any) => {
    if (email.tasks?.length > 0) return true;

    const summary =
      email.email_insight?.summary?.toLowerCase() || "";

    return (
      summary.includes("reply") ||
      summary.includes("submit") ||
      summary.includes("complete") ||
      summary.includes("schedule")
    );
  };

  // 🔥 FILTER LOGIC
  const filteredEmails = emails.filter((email) => {
    const category = email.email_insight?.category;

    switch (filter) {
      case "action":
        return isActionRequired(email);

      case "promotion":
        return category === "promotion";

      case "social":
        return category === "social";

      case "job":
        return category === "job";

      default:
        return true;
    }
  });

  // 🔥 SORT BY PRIORITY
  const sortedEmails = [...filteredEmails].sort(
    (a, b) =>
      (b.email_insight?.priority_score || 0) -
      (a.email_insight?.priority_score || 0)
  );

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="grid grid-cols-3 h-screen">
      {/* LEFT PANEL */}
      <div className="col-span-1 border-r p-4 bg-gray-50 overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Smart Inbox</h1>

          {/* 🔥 SYNC BUTTON */}
          <button
            onClick={handleSync}
            className="text-sm bg-black text-white px-3 py-1 rounded"
          >
            {syncing ? "Syncing..." : "Sync"}
          </button>
        </div>

        {/* 🔥 FILTER TABS */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { key: "all", label: "All" },
            { key: "action", label: "⚡ Action" },
            { key: "promotion", label: "Promo" },
            { key: "social", label: "Social" },
            { key: "job", label: "Jobs" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as FilterType)}
              className={`px-3 py-1 text-sm rounded ${
                filter === f.key
                  ? "bg-black text-white"
                  : "bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* EMAIL LIST */}
        <EmailList
          emails={sortedEmails}
          onSelect={setSelectedEmail}
        />
      </div>

      {/* RIGHT PANEL */}
      <div className="col-span-2 p-6 overflow-y-auto">
        {selectedEmail ? (
          <EmailDetail email={selectedEmail} />
        ) : (
          <p className="text-gray-500">
            Select an email to view details
          </p>
        )}
      </div>
    </div>
  );
}