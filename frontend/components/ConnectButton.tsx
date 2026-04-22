"use client";

import { googleAuthUrl } from "@/lib/api";

export default function ConnectButton() {
  const connectGmail = () => {
    window.location.href = googleAuthUrl();
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
