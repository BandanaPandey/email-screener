import { expect, test, type Page, type Route } from "@playwright/test";

type Rule = {
  id: number;
  field: string;
  operator: string;
  value: string;
  action: string;
};

async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

async function mockUnauthorizedSession(page: Page) {
  await page.route("http://localhost:3000/session", async (route) => {
    await fulfillJson(route, { authenticated: false }, 401);
  });
}

async function mockAuthenticatedSession(page: Page) {
  await page.route("http://localhost:3000/session", async (route) => {
    await fulfillJson(route, {
      authenticated: true,
      user: {
        id: 1,
        email: "owner@example.com",
      },
    });
  });
}

test("dashboard shows auth-required state when the session is unauthorized", async ({ page }) => {
  await mockUnauthorizedSession(page);

  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "Sign in to view your inbox" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Connect Gmail" })).toBeVisible();
});

test("authenticated dashboard loads inbox data and shows email detail", async ({ page }) => {
  await mockAuthenticatedSession(page);
  await page.route("http://localhost:3000/emails", async (route) => {
    await fulfillJson(route, {
      items: [
        {
          id: 1,
          subject: "Board update",
          sender: "ceo@example.com",
          body: "Please send the latest board deck.",
          received_at: "2026-04-24T10:00:00Z",
          provider: "google",
          email_insight: {
            category: "action_required",
            confidence: 0.9,
            reasoning: "Executive request",
            priority_score: 95,
            priority_reason: "High priority",
            summary: "Board deck requested.",
            reply_suggestion: null,
          },
          tasks: [],
        },
      ],
    });
  });

  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "Board update" })).toBeVisible();
  await page.getByRole("heading", { name: "Board update" }).click();
  await expect(page.getByText("Please send the latest board deck.")).toBeVisible();
  await expect(page.getByText("Board deck requested.").first()).toBeVisible();
});

test("task update flow works from the tasks page", async ({ page }) => {
  await mockAuthenticatedSession(page);
  await page.route(/http:\/\/localhost:3000\/tasks(\/\d+)?$/, async (route) => {
    if (route.request().method() === "GET") {
      await fulfillJson(route, {
        items: [
          {
            id: 11,
            title: "Send revised proposal",
            due_date: null,
            priority: "high",
            status: "pending",
            email: {
              id: 91,
              subject: "Proposal request",
            },
          },
        ],
      });
      return;
    }

    await fulfillJson(route, {
      task: {
        id: 11,
        title: "Send revised proposal",
        due_date: null,
        priority: "high",
        status: "completed",
        email: {
          id: 91,
          subject: "Proposal request",
        },
      },
    });
  });

  await page.goto("/tasks");

  await expect(page.getByText("Send revised proposal")).toBeVisible();
  await page.locator('input[type="checkbox"]').click();
  await expect(page.getByText("Task status updated.")).toBeVisible();
});

test("rule create and delete flow works from the rules page", async ({ page }) => {
  let rules: Rule[] = [];

  await mockAuthenticatedSession(page);
  await page.route("http://localhost:3000/rules", async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      await fulfillJson(route, { items: rules });
      return;
    }

    if (method === "POST") {
      const payload = route.request().postDataJSON() as {
        rule: Omit<Rule, "id">;
      };
      const newRule: Rule = {
        id: 1,
        ...payload.rule,
      };
      rules = [newRule];
      await fulfillJson(route, { rule: newRule });
      return;
    }

    await route.fallback();
  });

  await page.route(/http:\/\/localhost:3000\/rules\/\d+$/, async (route) => {
    if (route.request().method() === "DELETE") {
      rules = [];
      await route.fulfill({ status: 204 });
      return;
    }

    await route.fallback();
  });

  await page.goto("/rules");

  await expect(page.getByRole("heading", { name: "Rule Engine" })).toBeVisible();
  await page.getByPlaceholder("Value (e.g. invoice)").fill("invoice");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText("Rule created.")).toBeVisible();
  await expect(page.getByText(/invoice/)).toBeVisible();

  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("Rule deleted.")).toBeVisible();
  await expect(page.getByText("No rules yet")).toBeVisible();
});
