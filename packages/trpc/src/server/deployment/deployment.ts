import { prisma } from "@repo/database";
import { backendRes } from "../../helpers";
import { trpcProcedure, trpcRouter } from "../trpc";
import { deploymentZodSchema } from "./deploymentZod";

export const deploymentRouter = trpcRouter({
  read: trpcProcedure
    .input(deploymentZodSchema.read)
    .query(async ({ input }) => {
      try {
        const deployment = await prisma.deployments.findFirst({
          where: { id: input.deploymentId },
          include: { project: true },
        });
        return backendRes({ ok: true, result: deployment });
      } catch (error) {
        console.error(error);
        return backendRes({
          ok: false,
          error: (error as Error).message,
          result: null,
        });
      }
    }),
  create: trpcProcedure
    .input(deploymentZodSchema.create)
    .mutation(async ({ input }) => {
      try {
        const deployment = await prisma.deployments.create({
          data: {
            projectId: input.projectId,
            commitHash: input.commitHash,
            commitMessage: input.commitMessage,
            status: "Building",
          },
        });
        return backendRes({ ok: true, result: deployment });
      } catch (error) {
        console.error(error);
        return backendRes({
          ok: false,
          error: (error as Error).message,
          result: null,
        });
      }
    }),
});
