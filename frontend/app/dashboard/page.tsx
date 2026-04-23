"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import AuthRequiredState from "@/components/AuthRequiredState";
import EmptyState from "@/components/EmptyState";
import EmailList from "@/components/EmailListItem";
import EmailDetail from "@/components/EmailDetail";
import InlineMessage from "@/components/InlineMessage";
import useNotifications from "@/hooks/useNotifications";
import NotificationBanner from "@/components/NotificationBanner";
import {
  ApiError,
  fetchEmails as fetchEmailsRequest,
  fetchSession,
  syncEmails as syncEmailsRequest,
} from "@/lib/api";
import { isActionRequired } from "@/lib/email";
import type { Email } from "@/lib/types";

type FilterType =
  | "all"
  | "action"
  | "promotion"
  | "social"
  | "job";

export default function DashboardPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const notifiedIdsRef = useRef<Set<number>>(new Set());

  // 🔔 Notifications
  const notifications = useNotifications(emails);

  // 🔐 Request browser notification permission
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // 🔄 Fetch Emails
  const fetchEmails = async () => {
    try {
      const data = await fetchEmailsRequest();
      setEmails(data.items);
      setError("");
    } catch (err) {
      console.error("Fetch failed", err);
      setEmails([]);
      setError("We could not load your inbox right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSessionAndEmails = async () => {
      try {
        await fetchSession();
        setIsAuthenticated(true);
        await fetchEmails();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        console.error("Session check failed", err);
        setLoading(false);
      }
    };

    loadSessionAndEmails();
  }, []);

  // // 🔁 Auto polling
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchEmails();
  //   }, 30000);

  //   return () => clearInterval(interval);
  // }, []);

  // 🔥 Sync Trigger
  const handleSync = async () => {
    setSyncing(true);
    setError("");
    setSuccessMessage("");

    try {
      await syncEmailsRequest();
      await fetchEmails();
      setSuccessMessage("Inbox sync queued and refreshed.");
    } catch (err) {
      console.error("Sync failed", err);
      setError("Inbox sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  // 🔥 Detect action-required emails
  // 🔥 Filtering
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

  // 🔥 Sorting
  const sortedEmails = useMemo(
    () =>
      [...filteredEmails].sort(
        (a, b) =>
          (b.email_insight?.priority_score || 0) -
          (a.email_insight?.priority_score || 0)
      ),
    [filteredEmails]
  );

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    sortedEmails.forEach((email) => {
      const priorityScore = email.email_insight?.priority_score ?? 0;

      if (priorityScore > 85 && !notifiedIdsRef.current.has(email.id)) {
        new Notification("🔥 High Priority Email", {
          body: email.subject,
        });

        notifiedIdsRef.current.add(email.id);
      }
    });
  }, [sortedEmails]);

  // 🔢 Task count
  const totalTasks = emails.reduce(
    (acc, email) => acc + (email.tasks?.length || 0),
    0
  );

  if (loading) return <p className="p-4">Loading...</p>;
  if (!isAuthenticated) {
    return (
      <AuthRequiredState
        title="Sign in to view your inbox"
        message="Your inbox, tasks, and AI actions are available after you connect your Gmail account."
      />
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)] flex-col lg:grid lg:grid-cols-3">
      {/* LEFT PANEL */}
      <div className="border-b bg-gray-50 p-4 lg:col-span-1 lg:border-b-0 lg:border-r lg:overflow-y-auto">
        {/* HEADER */}
        <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold">Smart Inbox</h1>

          <div className="flex gap-2">
            {/* 🔄 Sync */}
            <button
              onClick={handleSync}
              className="text-sm bg-black text-white px-3 py-1 rounded"
            >
              {syncing ? "Syncing..." : "Sync"}
            </button>

            {/* 📌 View Tasks */}
            <Link
              href="/tasks"
              className="text-sm bg-gray-800 text-white px-3 py-1 rounded"
            >
              Tasks
            </Link>
          </div>
        </div>

        {/* 🔢 Task count */}
        <p className="text-xs text-gray-500 mb-3">
          {totalTasks} tasks across emails
        </p>
        {error && (
          <div className="mb-3">
            <InlineMessage message={error} tone="error" />
          </div>
        )}
        {successMessage && (
          <div className="mb-3">
            <InlineMessage message={successMessage} />
          </div>
        )}

        {/* 🔔 Notifications */}
        <NotificationBanner notifications={notifications} />

        {/* 🔥 FILTERS */}
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

        {/* 📩 EMAIL LIST */}
        <EmailList
          emails={sortedEmails}
          onSelect={setSelectedEmail}
        />
        {sortedEmails.length === 0 && (
          <EmptyState
            title="Inbox is empty"
            message="Sync your Gmail account to pull in messages and start triaging your inbox."
          />
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="p-6 lg:col-span-2 lg:overflow-y-auto">
        {selectedEmail ? (
          <EmailDetail key={selectedEmail?.id} email={selectedEmail} />
        ) : (
          <EmptyState
            title="Select an email"
            message="Pick a message from the inbox to view insights, tasks, and AI actions."
          />
        )}
      </div>
    </div>
  );
}
