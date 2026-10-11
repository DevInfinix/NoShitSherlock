import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { db } from "@/db/client";
import { accounts, sessions, users, verifications } from "@/db/schema";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

const emailFrom = process.env.EMAIL_FROM || "NoShitSherlock <onboarding@resend.dev>";

// In-memory sliding window to throttle external Resend API dispatches per recipient address
const emailDispatchCooldowns = new Map<string, number>();
const RESEND_EMAIL_COOLDOWN_MS = 60_000; // 60 seconds cooldown between dispatches to the same email

function checkEmailDispatchAllowed(email: string): { allowed: boolean; remainingSecs: number } {
  const normalized = email.trim().toLowerCase();
  const lastTime = emailDispatchCooldowns.get(normalized);
  const now = Date.now();

  if (lastTime && now - lastTime < RESEND_EMAIL_COOLDOWN_MS) {
    const remainingSecs = Math.ceil((RESEND_EMAIL_COOLDOWN_MS - (now - lastTime)) / 1000);
    return { allowed: false, remainingSecs };
  }

  // Periodic pruning of expired entries
  if (emailDispatchCooldowns.size > 1000) {
    for (const [key, timestamp] of emailDispatchCooldowns.entries()) {
      if (now - timestamp > RESEND_EMAIL_COOLDOWN_MS) {
        emailDispatchCooldowns.delete(key);
      }
    }
  }

  emailDispatchCooldowns.set(normalized, now);
  return { allowed: true, remainingSecs: 0 };
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET || "default-dev-secret-key-at-least-32-chars-long",
  baseURL:
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  rateLimit: {
    enabled: true,
    window: 60, // 60-second window
    max: 120, // 120 requests/minute baseline (generous for genuine navigation)
    storage: "memory",
    customRules: {
      "/sign-up/email": {
        window: 60,
        max: 5, // At most 5 registration attempts per minute per IP
      },
      "/sign-in/email": {
        window: 60,
        max: 10, // At most 10 login attempts per minute per IP (prevents credential stuffing)
      },
      "/send-verification-email": {
        window: 60,
        max: 2, // At most 2 verification email requests per minute per IP (protects Resend quota)
      },
      "/forget-password": {
        window: 60,
        max: 3, // At most 3 password reset requests per minute per IP
      },
    },
  },
  user: {
    additionalFields: {
      agentTag: {
        type: "string",
        required: false,
      },
      username: {
        type: "string",
        required: false,
      },
      trainingCompleted: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // 60 minutes
    sendVerificationEmail: async ({ user, url, token }) => {
      const { allowed, remainingSecs } = checkEmailDispatchAllowed(user.email);
      if (!allowed) {
        console.warn(
          `[AUTH RATE-LIMIT] Suppressed duplicate email dispatch to ${user.email}. Resend cooldown active for ${remainingSecs}s.`,
        );
        return;
      }

      console.log(`[AUTH] Dispatching verification email to ${user.email}...`);
      if (resend) {
        try {
          const result = await resend.emails.send({
            from: emailFrom,
            to: user.email,
            subject: "NoShitSherlock — Your Detective Verification Link",
            text: `NoShitSherlock // Operative Verification\n\nOperative: ${user.name || "Detective"}\nRegistered Email: ${user.email}\n\nPlease verify your account by opening this link:\n${url}\n\nThis authorization link expires in 60 minutes.`,
            html: `<div style="font-family: Georgia, serif; max-width: 580px; width: 100%; margin: 0 auto; background: #120e0c; color: #e8dcc8; padding: 28px; border: 2px solid #79604a; box-sizing: border-box; overflow: hidden;">
              <div style="border-bottom: 1px solid #79604a44; padding-bottom: 16px; margin-bottom: 20px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #a7192d; font-weight: bold;">Departmental Clearance Protocol</span>
                <h2 style="font-family: Georgia, serif; font-size: 22px; color: #e8dcc8; margin: 6px 0 0 0; letter-spacing: 1px;">NoShitSherlock // Account Verification</h2>
              </div>

              <p style="font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">Hello Operative <strong>${user.name || "Detective"}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.6; color: #b8ad98; margin: 0 0 16px 0;">
                Your operative enrollment has been recorded for the following account:
              </p>

              <div style="background: #1c1510; border: 1px solid #79604a55; padding: 14px 18px; margin: 0 0 24px 0; border-radius: 2px;">
                <p style="font-family: 'Courier New', Courier, monospace; font-size: 13px; margin: 0 0 6px 0; color: #e8dcc8;">
                  <span style="color: #79604a; text-transform: uppercase;">Registered Callsign:</span> <strong>${user.name || "Detective"}</strong>
                </p>
                <p style="font-family: 'Courier New', Courier, monospace; font-size: 13px; margin: 0; color: #e8dcc8;">
                  <span style="color: #79604a; text-transform: uppercase;">Official Account Email:</span> <strong style="color: #c59e58;">${user.email}</strong>
                </p>
              </div>

              <p style="font-size: 14px; line-height: 1.6; color: #b8ad98; margin: 0 0 24px 0;">
                To activate your warrant and gain access to active cold cases and physical case files, click the button below:
              </p>

              <div style="text-align: center; margin: 28px 0;">
                <a href="${url}" style="display: inline-block; background-color: #a7192d; color: #ffffff; text-decoration: none; padding: 14px 28px; font-family: 'Courier New', Courier, monospace; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; border: 1px solid #c2293e;">
                  Verify Operative Credentials &rarr;
                </a>
              </div>

              <div style="margin-top: 28px; padding: 14px; background: #181310; border: 1px solid #79604a33; border-radius: 2px;">
                <p style="font-size: 11px; margin: 0 0 6px 0; color: #79604a; text-transform: uppercase; font-family: monospace;">If the button above does not work, open this direct verification link:</p>
                <p style="font-size: 11px; margin: 0; word-break: break-all; color: #b8ad98; font-family: monospace; line-height: 1.5;">
                  <a href="${url}" style="color: #c59e58; text-decoration: underline;">${url}</a>
                </p>
              </div>

              <p style="font-size: 11px; color: #79604a; border-top: 1px solid #79604a33; padding-top: 16px; margin-top: 24px;">
                This authorization link expires in 60 minutes. If you did not register for NoShitSherlock, no action is needed.
              </p>
            </div>`,
          });
          if (result.error) {
            console.error("[Resend Error]:", result.error);
            console.log("================================================================");
            console.log(`[DISPATCH FALLBACK] VERIFICATION LINK FOR ${user.email}:`);
            console.log(`URL: ${url}`);
            console.log(`CODE: ${token}`);
            console.log("================================================================");
          } else {
            console.log(
              `[Resend Success] Verification email dispatched to ${user.email} (ID: ${result.data?.id})`,
            );
          }
        } catch (err) {
          console.error("[Resend Exception]:", err);
          console.log(`[DISPATCH FALLBACK] URL: ${url} | CODE: ${token}`);
        }
      } else {
        console.log("================================================================");
        console.log(`[DEPARTMENT DISPATCH] EMAIL VERIFICATION LINK FOR ${user.email}:`);
        console.log(`URL: ${url}`);
        console.log(`CODE: ${token}`);
        console.log("================================================================");
      }
    },
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
      ? {
          discord: {
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
          },
        }
      : {}),
  },
});
