"use client";

import { useEffect, useState } from "react";

export default function useNotifications(emails: any[]) {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!emails || emails.length === 0) return;

    const newNotifications: any[] = [];

    emails.forEach((email) => {
      const insight = email.email_insight;

      // 🔥 High priority email
      if (insight?.priority_score > 80) {
        newNotifications.push({
          type: "priority",
          message: `High priority: ${email.subject}`,
        });
      }

      // 🔥 Tasks due today
      email.tasks?.forEach((task: any) => {
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