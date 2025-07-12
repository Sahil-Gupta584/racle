import { prisma } from "@repo/database";
import { env } from "@repo/lib/envs";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID!,
      clientSecret: env.GITHUB_SECRET,
      scope: ["admin:repo_hook"],
    },
  },
  advanced: { defaultCookieAttributes: { sameSite: "None", secure: true } },
  trustedOrigins: [env.VITE_WEB_BASE_URL],
  secret: env.BETTER_AUTH_SECRET,
});
