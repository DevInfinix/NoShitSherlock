import { auth } from "@/server/auth";

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode = 401,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function getCurrentUser(headers: Headers) {
  try {
    const session = await auth.api.getSession({ headers });
    return session?.user ?? null;
  } catch {
    return null;
  }
}

export async function requireUser(headers: Headers) {
  const user = await getCurrentUser(headers);
  if (!user) {
    throw new AuthError("You must be logged in to perform this action.");
  }
  return user;
}
