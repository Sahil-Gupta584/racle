import { z } from "zod";

export const projectsZodSchema = {
  create: z.object({
    userId: z.string(),
    name: z.string().min(1, "Project name is required"),
    domainName: z
      .string()
      .min(3, "Domain name must be at least 3 characters")
      .max(63, "Domain name must be at most 63 characters")
      .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, {
        message:
          "Domain name can only contain lowercase letters, numbers, and hyphens. It cannot start or end with a hyphen.",
      }),
    repositoryUrl: z
      .string()
      .min(1, "Repository URL is required")
      .url("Must be a valid URL")
      .refine((val) => /^https:\/\/github\.com\/[^/]+\/[^/]+?$/.test(val), {
        message:
          "Repository URL must be a valid GitHub repo, e.g. https://github.com/user/repo",
      })
      .superRefine(async (url, ctx) => {
        const [, , , owner, repo] = url.split("/");

        const checkFileExists = async (filename: string) => {
          const res = await fetch(
            `https://raw.githubusercontent.com/${owner}/${repo}/main/${filename}`
          );
          return res.ok;
        };

        const hasViteConfigTs = await checkFileExists("vite.config.ts");
        const hasViteConfigJs = await checkFileExists("vite.config.js");

        if (!hasViteConfigTs && !hasViteConfigJs) {
          ctx.addIssue({
            code: "custom",
            message:
              "Only react(Vite) projects are allowed. Repository must contain vite.config.ts or vite.config.js at the root to be a valid Vite project.",
          });
        }
      }),

    installCmd: z.string().min(1, "Install command is required"),
    buildCmd: z.string().min(1, "Build command is required"),
    runCmd: z.string().min(1, "Run command is required"),
    envs: z.string().optional(),
  }),

  getAll: z.object({ userId: z.string() }),
  read: z.object({ projectId: z.string() }),
  delete: z.object({ projectId: z.string() }),
  toggleAutoDeploy: z.object({
    projectId: z.string(),
    autoDeploy: z.boolean(),
  }),
};
