"use client";

import type { NotificationItem } from "@/lib/types";

type Props = {
  notifications: NotificationItem[];
};

export default function NotificationBanner({ notifications }: Props) {
  if (!notifications.length) return null;

  return (
    <div className="mb-4 space-y-2">
      {notifications.slice(0, 3).map((n, i) => (
        <div
          key={i}
          className={`p-3 rounded text-sm ${
            n.type === "priority"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}
