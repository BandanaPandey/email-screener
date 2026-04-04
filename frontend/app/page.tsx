"use client";

import { useEffect, useState } from "react";
import { fetchHealth } from "@/lib/api";

export default function Home() {
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchHealth().then((data) => setStatus(data.status));
  }, []);

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Email Screener 🚀</h1>
      <p>Backend Status: {status}</p>
    </main>
  );
}