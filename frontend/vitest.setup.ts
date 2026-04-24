import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

const requestPermission = vi.fn(async () => "denied");

class MockNotification {
  static permission = "denied";
  static requestPermission = requestPermission;

  constructor() {}
}

Object.defineProperty(globalThis, "Notification", {
  writable: true,
  value: MockNotification,
});

beforeEach(() => {
  globalThis.fetch = vi.fn();
  requestPermission.mockClear();
});

afterEach(() => {
  cleanup();
});
