import type {
  CollectionResponse,
  Email,
  ExtractedTask,
  Rule,
  Task,
  UserSession,
} from "@/lib/types";

const FALLBACK_API_BASE_URL = "http://localhost:3000";
const FALLBACK_APP_URL = "http://localhost:3001";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || FALLBACK_API_BASE_URL;

export const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || FALLBACK_APP_URL;

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | object | null;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message || `API request failed: ${status}`);
    this.name = "ApiError";
    this.status = status;
  }
}

async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { headers, body, ...rest } = options;
  const requestHeaders = new Headers(headers);

  let requestBody: BodyInit | undefined;

  if (body && !(body instanceof FormData) && typeof body === "object") {
    requestHeaders.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  } else if (typeof body === "string" || body instanceof FormData) {
    requestBody = body;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...rest,
    headers: requestHeaders,
    body: requestBody,
  });

  if (!response.ok) {
    throw new ApiError(response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export function googleAuthUrl() {
  return `${API_BASE_URL}/auth/google_oauth2`;
}

export async function fetchHealth() {
  return apiRequest<{ status: string }>("/health");
}

export async function fetchSession() {
  return apiRequest<UserSession>("/session");
}

export async function fetchEmails() {
  return apiRequest<CollectionResponse<Email>>("/emails");
}

export async function syncEmails() {
  return apiRequest<{ message: string }>("/sync_emails", {
    method: "POST",
  });
}

export async function fetchTasks() {
  return apiRequest<CollectionResponse<Task>>("/tasks");
}

export async function updateTaskStatus(taskId: number, status: string) {
  return apiRequest<{ task: Task }>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: {
      task: { status },
    },
  });
}

export async function fetchRules() {
  return apiRequest<CollectionResponse<Rule>>("/rules");
}

export async function createRule(rule: Record<string, string>) {
  return apiRequest<{ rule: Rule }>("/rules", {
    method: "POST",
    body: { rule },
  });
}

export async function deleteRule(ruleId: number) {
  return apiRequest(`/rules/${ruleId}`, {
    method: "DELETE",
  });
}

export async function fetchAiReply(emailId: number, tone: string) {
  return apiRequest<{ reply: string }>("/ai/reply", {
    method: "POST",
    body: {
      email_id: emailId,
      tone,
    },
  });
}

export async function fetchAiSummary(emailId: number, tone: string) {
  return apiRequest<{ summary: string }>("/ai/summarize", {
    method: "POST",
    body: {
      email_id: emailId,
      tone,
    },
  });
}

export async function extractTasks(emailId: number, tone: string) {
  return apiRequest<{ tasks: ExtractedTask[] }>("/ai/extract_tasks", {
    method: "POST",
    body: {
      email_id: emailId,
      tone,
    },
  });
}
