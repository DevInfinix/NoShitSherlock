import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { db } from "@/db/client";
import { accounts, sessions, users, verifications } from "@/db/schema";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

const emailFrom = process.env.EMAIL_FROM || "NoShitSherlock <auth@yourdomain.com>";

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
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 600, // 10 minutes (600 seconds)
    sendVerificationEmail: async ({ user, url, token }) => {
      if (resend) {
        await resend.emails.send({
          from: emailFrom,
          to: user.email,
          subject: "NoShitSherlock — Your Detective Verification Code",
          text: `Your verification code is: ${token}\nOr verify your account by opening: ${url}\nThis code expires in 10 minutes.`,
          html: `<p>Your verification code is: <strong>${token}</strong></p><p><a href="${url}">Click here to verify your account</a></p><p>This code expires in 10 minutes.</p>`,
        });
      } else {
        console.log(`[Dev Auth] Verification code for ${user.email}: ${token} (Link: ${url})`);
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
