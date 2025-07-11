import { prisma } from "@repo/database";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../../../../.env") });
console.log({
  source: "auth.ts",
  "process.env.GOOGLE_CLIENT_ID": process.env.GOOGLE_CLIENT_ID,
  "process.env.DATABASE_URL": process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_SECRET,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_SECRET,
      scope: ["admin:repo_hook"],
    },
    advanced: { defaultCookieAttributes: { sameSite: "None", secure: true } },
  },
  trustedOrigins: [process.env.VITE_WEB_BASE_URL],
  secret: process.env.BETTER_AUTH_SECRET,
});
