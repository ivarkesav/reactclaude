// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const mockSet = vi.fn();
const mockGet = vi.fn();
const mockDelete = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    set: mockSet,
    get: mockGet,
    delete: mockDelete,
  })),
}));

import { createSession, getSession, deleteSession } from "@/lib/auth";

beforeEach(() => {
  vi.clearAllMocks();
});

test("createSession sets an httpOnly cookie with a JWT token", async () => {
  await createSession("user-123", "test@example.com");

  expect(mockSet).toHaveBeenCalledTimes(1);

  const [cookieName, token, options] = mockSet.mock.calls[0];
  expect(cookieName).toBe("auth-token");
  expect(typeof token).toBe("string");
  expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
  expect(options.httpOnly).toBe(true);
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
});

test("createSession sets cookie expiry to 7 days from now", async () => {
  const before = Date.now();
  await createSession("user-123", "test@example.com");
  const after = Date.now();

  const [, , options] = mockSet.mock.calls[0];
  const expiresTime = options.expires.getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  expect(expiresTime).toBeGreaterThanOrEqual(before + sevenDaysMs);
  expect(expiresTime).toBeLessThanOrEqual(after + sevenDaysMs);
});

test("createSession sets secure flag based on NODE_ENV", async () => {
  await createSession("user-123", "test@example.com");

  const [, , options] = mockSet.mock.calls[0];
  expect(options.secure).toBe(process.env.NODE_ENV === "production");
});

test("createSession token can be verified by getSession", async () => {
  await createSession("user-123", "test@example.com");

  const [, token] = mockSet.mock.calls[0];
  mockGet.mockReturnValue({ value: token });

  const session = await getSession();
  expect(session).not.toBeNull();
  expect(session!.userId).toBe("user-123");
  expect(session!.email).toBe("test@example.com");
});

test("createSession generates unique tokens for different users", async () => {
  await createSession("user-1", "a@example.com");
  await createSession("user-2", "b@example.com");

  const token1 = mockSet.mock.calls[0][1];
  const token2 = mockSet.mock.calls[1][1];
  expect(token1).not.toBe(token2);
});

test("getSession returns null when no cookie exists", async () => {
  mockGet.mockReturnValue(undefined);

  const session = await getSession();
  expect(session).toBeNull();
});

test("getSession returns session payload for a valid token", async () => {
  await createSession("user-456", "hello@example.com");
  const [, token] = mockSet.mock.calls[0];
  mockGet.mockReturnValue({ value: token });

  const session = await getSession();
  expect(session).not.toBeNull();
  expect(session!.userId).toBe("user-456");
  expect(session!.email).toBe("hello@example.com");
  expect(session!.expiresAt).toBeDefined();
});

test("getSession returns null for an invalid token", async () => {
  mockGet.mockReturnValue({ value: "invalid.jwt.token" });

  const session = await getSession();
  expect(session).toBeNull();
});

test("getSession returns null for a tampered token", async () => {
  await createSession("user-123", "test@example.com");
  const [, token] = mockSet.mock.calls[0];
  const tampered = token.slice(0, -5) + "XXXXX";
  mockGet.mockReturnValue({ value: tampered });

  const session = await getSession();
  expect(session).toBeNull();
});

test("getSession returns null for an empty cookie value", async () => {
  mockGet.mockReturnValue({ value: "" });

  const session = await getSession();
  expect(session).toBeNull();
});
