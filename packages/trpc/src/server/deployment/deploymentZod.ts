import { z } from "zod";

export const deploymentZodSchema = {
  create: z.object({
    projectId: z.string(),
    commitHash: z.string(),
    commitMessage: z.string(),
  }),
  read: z.object({
    deploymentId: z.string(),
  }),
};
