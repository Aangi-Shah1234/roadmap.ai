import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users, User } from "@/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "roadmap-ai-super-secret-production-key-2026"
);

const COOKIE_NAME = "roadmap_token";

export interface SessionPayload {
  userId: string;
  email: string;
  role: "admin" | "learner";
  name: string;
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function setSessionCookie(payload: SessionPayload): Promise<string> {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false, // Must be false to support HTTP IP addresses (e.g. EC2 http://100.59.9.255)
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return token;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAdmin(): Promise<SessionPayload> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return user;
}

const PROGRESS_COOKIE_NAME = "roadmap_progress";

export interface CookieProgressState {
  added: string[];
  removed: string[];
}

export async function getCookieProgress(email: string): Promise<CookieProgressState> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(PROGRESS_COOKIE_NAME)?.value;
    if (!raw) return { added: [], removed: [] };
    const parsed = JSON.parse(raw);
    const key = email.toLowerCase().trim();
    const entry = parsed[key];
    if (!entry) return { added: [], removed: [] };
    return {
      added: Array.isArray(entry.added) ? entry.added : [],
      removed: Array.isArray(entry.removed) ? entry.removed : [],
    };
  } catch {
    return { added: [], removed: [] };
  }
}

export async function setCookieProgress(
  email: string,
  topicId: string,
  completed: boolean
): Promise<void> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(PROGRESS_COOKIE_NAME)?.value;
    const parsed = raw ? JSON.parse(raw) : {};
    const key = email.toLowerCase().trim();
    const current: CookieProgressState = parsed[key] || { added: [], removed: [] };

    const addedSet = new Set<string>(current.added || []);
    const removedSet = new Set<string>(current.removed || []);

    if (completed) {
      addedSet.add(topicId);
      removedSet.delete(topicId);
    } else {
      addedSet.delete(topicId);
      removedSet.add(topicId);
    }

    parsed[key] = {
      added: Array.from(addedSet),
      removed: Array.from(removedSet),
    };

    cookieStore.set(PROGRESS_COOKIE_NAME, JSON.stringify(parsed), {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch (err) {
    console.error("Failed to set progress cookie:", err);
  }
}

