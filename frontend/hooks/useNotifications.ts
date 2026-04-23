"use client";

import { useEffect, useState } from "react";
import type { Email, NotificationItem } from "@/lib/types";

export default function useNotifications(emails: Email[]) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!emails || emails.length === 0) return;

    const newNotifications: NotificationItem[] = [];

    emails.forEach((email) => {
      const insight = email.email_insight;
      const priorityScore = insight?.priority_score ?? 0;

      // 🔥 High priority email
      if (priorityScore > 80) {
        newNotifications.push({
          type: "priority",
          message: `High priority: ${email.subject}`,
        });
      }

      // 🔥 Tasks due today
      email.tasks.forEach((task) => {
        if (!task.due_date) return;

        const due = new Date(task.due_date);
        const today = new Date();

        if (
          due.toDateString() === today.toDateString() &&
          task.status === "pending"
        ) {
          newNotifications.push({
            type: "task",
            message: `Task due today: ${task.title}`,
          });
        }
      });
    });

    setNotifications(newNotifications);
  }, [emails]);

  return notifications;
}
