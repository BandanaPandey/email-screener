"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [emails, setEmails] = useState([]);

  const fetchEmails = async () => {
    const res = await fetch("http://localhost:3000/emails");
    const data = await res.json();
    setEmails(data);
  };

  const syncEmails = async () => {
    await fetch("http://localhost:3000/sync_emails", {
      method: "POST",
    });
    fetchEmails();
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold">Dashboard</h1>

      <button
        onClick={syncEmails}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        Sync Emails
      </button>

      <ul className="mt-6">
        {emails.map((email: any) => (
          <li key={email.id} className="border-b py-2">
            <p><strong>{email.subject}</strong></p>
            <p>{email.sender}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}