"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `px-3 py-1 rounded ${
      pathname === path ? "bg-black text-white" : "bg-gray-200"
    }`;

  return (
    <div className="flex gap-2 p-4 border-b">
      <Link href="/dashboard" className={linkClass("/dashboard")}>
        Inbox
      </Link>

      <Link href="/tasks" className={linkClass("/tasks")}>
        Tasks
      </Link>

      <Link href="/rules" className={linkClass("/rules")}>
        Rules
      </Link>
    </div>
  );
}
