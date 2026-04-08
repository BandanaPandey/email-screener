"use client";

import { useEffect, useState } from "react";
import EmailListItem from "../../components/EmailListItem";
import EmailDetail from "../../components/EmailDetail";

type Email = {
  id: number;
  subject: string;
  sender: string;
  body: string;
  received_at: string;
  email_insight?: {
    category: string;
    confidence: number;
  };
};

export default function DashboardPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  useEffect(() => {
    fetchEmails();
  }, []);

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

  const triggerSync = async () => {
  try {
    const res = await fetch("http://localhost:3000/sync_emails", {
      method: "POST"
    });

    if (!res.ok) {
      throw new Error("Request failed");
    }

    alert("Sync started 🚀");
  } catch (err) {
    console.error(err);
    alert("Failed to sync emails ❌");
  }
};

  return (
    <div className="flex h-screen">
      {/* LEFT: Email List */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Inbox</h2>
          <button
            onClick={triggerSync}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Sync
          </button>
        </div>

        {loading ? (
          <p className="p-4">Loading...</p>
        ) : emails.length === 0 ? (
          <p className="p-4">No emails found</p>
        ) : (
          emails.map((email) => (
            <EmailListItem
              key={email.id}
              email={email}
              onClick={() => setSelectedEmail(email)}
            />
          ))
        )}
      </div>

      {/* RIGHT: Email Detail */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedEmail ? (
          <EmailDetail email={selectedEmail} />
        ) : (
          <p>Select an email to view details</p>
        )}
      </div>
    </div>
  );
}