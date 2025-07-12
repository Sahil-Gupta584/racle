import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import z from "zod";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

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
  ZONE_ID: z.string().length(32, "Expected 32-character Zone ID"),
  BACKEND_IP: z.string().min(1),

  BETTER_AUTH_SECRET: z.string().min(1),
  DATABASE_URL: z.string().min(1),

  VITE_WEB_BASE_URL: z.string().url(),
  VITE_BACKEND_URL: z.string().url(),
  PORT: z.coerce.number().min(1).max(65535),
});

export const parseRes = envSchema.safeParse(process.env);

if (!parseRes.success) {
  console.error("Environment variables validation failed:", parseRes.error);
  throw new Error("Invalid environment variables");
}
export const env = parseRes.data;
