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
          "Repository URL must be a valid GitHub repo, e.g. https://github.com/user/repo ",
      }),
    installCmd: z.string().min(1, "Install command is required"),
    buildCmd: z.string().min(1, "Build command is required"),
    runCmd: z.string().min(1, "Run command is required"),
    envs: z.string().optional(),
  }),

  read: z.object({
    projectId: z.string(),
  }),
  delete: z.object({
    projectId: z.string(),
  }),
  toggleAutoDeploy: z.object({
    projectId: z.string(),
    autoDeploy: z.boolean(),
  }),
};
