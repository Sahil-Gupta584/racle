import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import z from "zod";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../secret/.env") });

const dummyEnv = {
  GOOGLE_CLIENT_ID: "1234567890abcdef.apps.googleusercontent.com",
  GOOGLE_SECRET: "dummy-google-secret",

  CLOUDFLARE_ACCESS_KEY_ID: "1234567890abcdef1234567890abcdef", // 32 characters
  CLOUDFLARE_SECRET_ACCESS_KEY: "dummy-cloudflare-secret",
  CLOUDFLARE_ENDPOINT: "https://dummy-cloudflare-endpoint.com",

  GITHUB_CLIENT_ID: "dummy-github-client-id",
  GITHUB_SECRET: "dummy-github-secret",
  GITHUB_WEBHOOK_SECRET: "dummy-webhook-secret",

  CLOUDFLARE_API_TOKEN: "dummy-cloudflare-api-token",
  CLOUDFLARE_API_KEY: "dummy-cloudflare-api-key",
  CLOUDFLARE_EMAIL: "admin@example.com",
  CLOUDFLARE_ZONE_ID: "abcdef123456abcdef123456abcdef12", // 32 characters

  BACKEND_IP: "127.0.0.1", // optional

  BETTER_AUTH_SECRET: "dummy-auth-secret",
  DATABASE_URL: "postgresql://user:password@localhost:5432/dbname",

  VITE_WEB_BASE_URL: "https://frontend.example.com",
  VITE_BACKEND_URL: "https://api.example.com",
  PORT: 3000,
};

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z
    .string()
    .regex(/^.+\.apps\.googleusercontent\.com$/, "Invalid Google Client ID"),
  GOOGLE_SECRET: z.string().min(1),

  CLOUDFLARE_ACCESS_KEY_ID: z
    .string()
    .length(32, "Expected 32-character CLOUDFLARE access key"),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string().min(1),
  CLOUDFLARE_ENDPOINT: z.string().url(),

  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_SECRET: z.string().min(1),
  GITHUB_WEBHOOK_SECRET: z.string().min(1),

  CLOUDFLARE_API_TOKEN: z.string().min(1),
  CLOUDFLARE_API_KEY: z.string().min(1),
  CLOUDFLARE_EMAIL: z.string().email(),
  CLOUDFLARE_ZONE_ID: z.string().length(32, "Expected 32-character Zone ID"),
  BACKEND_IP: z.string().min(1).optional(),

  BETTER_AUTH_SECRET: z.string().min(1),
  DATABASE_URL: z.string().min(1),

  VITE_WEB_BASE_URL: z.string().url(),
  VITE_BACKEND_URL: z.string().url(),
  PORT: z.coerce.number().min(1).max(65535),
});

export const parseRes = envSchema.safeParse(process.env);
// export const parseRes = envSchema.safeParse(dummyEnv);

if (!parseRes.success) {
  console.error("Environment variables validation failed:", parseRes.error);
  throw new Error("Invalid environment variables");
}
export const env = parseRes.data;
