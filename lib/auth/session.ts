import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { AdminSession, canAccess, isSuperAdmin } from "./permissions";

const cookieName = "fitaru_admin_session";
const sessionDurationMs = 1000 * 60 * 60 * 8;

function getSigningSecret() {
  return env.SUPABASE_SERVICE_ROLE_KEY || "fitaru-dev-session-secret";
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSigningSecret()).update(payload).digest("base64url");
}

function encodeSession(session: AdminSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decodeSession(value: string): AdminSession | null {
  const [payload, signature] = value.split(".");

  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;

    if (!session.expiresAt || session.expiresAt < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function createAdminSession(input: Omit<AdminSession, "expiresAt">) {
  const cookieStore = await cookies();
  const session: AdminSession = {
    ...input,
    expiresAt: Date.now() + sessionDurationMs,
  };

  cookieStore.set(cookieName, encodeSession(session), {
    httpOnly: true,
    maxAge: sessionDurationMs / 1000,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(cookieName)?.value;

  if (!value) {
    return null;
  }

  return decodeSession(value);
}

export async function requireAdmin(area?: string) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  if (area && !canAccess(session.role, area)) {
    redirect("/");
  }

  return session;
}

export async function requireSuperAdmin() {
  const session = await requireAdmin();

  if (!isSuperAdmin(session.role)) {
    redirect("/");
  }

  return session;
}
