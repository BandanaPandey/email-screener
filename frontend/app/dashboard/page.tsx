"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthRequiredState from "@/components/AuthRequiredState";
import EmailList from "@/components/EmailListItem";
import EmailDetail from "@/components/EmailDetail";
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
    } catch (err) {
      console.error("Fetch failed", err);
      setEmails([]);
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

    try {
      await syncEmailsRequest();
      await fetchEmails();
    } catch (err) {
      console.error("Sync failed", err);
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
  const sortedEmails = Array.isArray(filteredEmails)
    ? [...filteredEmails].sort(
        (a, b) =>
          (b.email_insight?.priority_score || 0) -
          (a.email_insight?.priority_score || 0)
      )
    : [];

  // 🔔 Prevent duplicate notifications
  const [notifiedIds, setNotifiedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    sortedEmails.forEach((email) => {
      const priorityScore = email.email_insight?.priority_score ?? 0;

      if (
        priorityScore > 85 &&
        !notifiedIds.has(email.id)
      ) {
        new Notification("🔥 High Priority Email", {
          body: email.subject,
        });

        setNotifiedIds((prev) => new Set(prev).add(email.id));
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
    <div className="grid grid-cols-3 h-screen">
      {/* LEFT PANEL */}
      <div className="col-span-1 border-r p-4 bg-gray-50 overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-2">
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
      </div>

      {/* RIGHT PANEL */}
      <div className="col-span-2 p-6 overflow-y-auto">
        {selectedEmail ? (
          <EmailDetail key={selectedEmail?.id} email={selectedEmail} />
        ) : (
          <p className="text-gray-500">
            Select an email to view details
          </p>
        )}
      </div>
    </div>
  );
}
