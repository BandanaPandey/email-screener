export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "completed";

export type UserSession = {
  authenticated: true;
  user: {
    id: number;
    email: string;
  };
};

export type EmailInsight = {
  category: string | null;
  confidence: number | null;
  reasoning: string | null;
  priority_score: number | null;
  priority_reason: string | null;
  summary: string | null;
  reply_suggestion: string | null;
};

export type EmailTask = {
  id: number;
  title: string;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
};

export type Task = EmailTask & {
  email?: {
    id: number;
    subject: string;
  } | null;
};

export type Email = {
  id: number;
  subject: string;
  sender: string;
  body: string;
  received_at: string | null;
  provider: string | null;
  email_insight: EmailInsight | null;
  tasks: EmailTask[];
};

export type Rule = {
  id: number;
  field: string;
  operator: string;
  value: string;
  action: string;
};

export type ExtractedTask = {
  title: string;
  due_date: string | null;
  priority: TaskPriority;
};

export type NotificationItem = {
  type: "priority" | "task";
  message: string;
};

export type CollectionResponse<T> = {
  items: T[];
};
