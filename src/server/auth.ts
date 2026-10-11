import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { db } from "@/db/client";
import { accounts, sessions, users, verifications } from "@/db/schema";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

const emailFrom = process.env.EMAIL_FROM || "NoShitSherlock <onboarding@resend.dev>";

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
    requireEmailVerification: false,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // 60 minutes
    sendVerificationEmail: async ({ user, url, token }) => {
      console.log(`[AUTH] Dispatching verification email to ${user.email}...`);
      if (resend) {
        try {
          const result = await resend.emails.send({
            from: emailFrom,
            to: user.email,
            subject: "NoShitSherlock — Your Detective Verification Code",
            text: `Your verification code is: ${token}\nOr verify your account by opening: ${url}\nThis code expires in 60 minutes.`,
            html: `<div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; background: #120e0c; color: #e8dcc8; padding: 32px; border: 2px solid #79604a;">
              <h2 style="font-family: Courier, monospace; color: #a7192d; margin-top: 0; text-transform: uppercase; letter-spacing: 2px;">NoShitSherlock // Operative Verification</h2>
              <p style="font-size: 15px; line-height: 1.6;">Operative ${user.name || user.email},</p>
              <p style="font-size: 14px; line-height: 1.6; color: #b8ad98;">To verify your credentials and gain active clearance to departmental case files, confirm your email address below:</p>
              <div style="background: #1c1510; border: 1px dashed #a7192d; padding: 16px; text-align: center; margin: 24px 0;">
                <span style="font-family: Courier, monospace; font-size: 24px; font-weight: bold; color: #e8dcc8; letter-spacing: 4px;">${token}</span>
              </div>
              <p style="text-align: center; margin: 24px 0;">
                <a href="${url}" style="background: #641b1b; color: #e8dcc8; padding: 12px 24px; text-decoration: none; font-family: Courier, monospace; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border: 1px solid #a7192d;">Verify Active Clearance</a>
              </p>
              <p style="font-size: 11px; color: #79604a; border-top: 1px solid #79604a33; padding-top: 16px;">This authorization token expires in 60 minutes. If you did not initiate operative enrollment, ignore this dispatch.</p>
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
