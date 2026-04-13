"use client";

export default function NotificationBanner({ notifications }: any) {
  if (!notifications.length) return null;

  return (
    <div className="mb-4 space-y-2">
      {notifications.slice(0, 3).map((n: any, i: number) => (
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