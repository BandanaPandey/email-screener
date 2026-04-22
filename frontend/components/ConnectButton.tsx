"use client";

import { API_BASE_URL } from "@/lib/api";

export default function ConnectButton() {
  const connectGmail = () => {
    window.location.href = `${API_BASE_URL}/auth/google_oauth2`;
  };

  return (
    <button
      onClick={connectGmail}
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
    >
      Connect Gmail
    </button>
  );
}
