"use client";

import type { Email, NotificationItem } from "@/lib/types";

export default function useNotifications(emails: Email[]) {
  if (!emails.length) return [];

  const notifications: NotificationItem[] = [];

  emails.forEach((email) => {
    const insight = email.email_insight;
    const priorityScore = insight?.priority_score ?? 0;

    if (priorityScore > 80) {
      notifications.push({
        type: "priority",
        message: `High priority: ${email.subject}`,
      });
    }

    email.tasks.forEach((task) => {
      if (!task.due_date) return;

      const due = new Date(task.due_date);
      const today = new Date();

      if (
        due.toDateString() === today.toDateString() &&
        task.status === "pending"
      ) {
        notifications.push({
          type: "task",
          message: `Task due today: ${task.title}`,
        });
      }
    });
  });

  return notifications;
}
