import { prisma } from "@repo/database";
import { backendRes } from "../../helpers";
import { trpcProcedure, trpcRouter } from "../trpc";
import { projectsZodSchema } from "./projectsZodSchema";

export const projectsRouter = trpcRouter({
  getAll: trpcProcedure.query(async ({ input }) => {
    try {
      const projects = await prisma.projects.findMany({
        include: { _count: { select: { deployments: true } } },
      });
      return backendRes({ ok: true, result: projects });
    } catch (error) {
      console.error(error);
      return backendRes({
        ok: false,
        error: (error as Error).message,
        result: null,
      });
    }
  }),
  read: trpcProcedure.input(projectsZodSchema.read).query(async ({ input }) => {
    try {
      const projects = await prisma.projects.findUnique({
        where: {
          id: input.projectId,
        },
        include: { deployments: true },
      });
      return backendRes({ ok: true, result: projects });
    } catch (error) {
      console.error(error);
      return backendRes({
        ok: false,
        error: (error as Error).message,
        result: null,
      });
    }
  }),
  delete: trpcProcedure
    .input(projectsZodSchema.delete)
    .mutation(async ({ input }) => {
      try {
        const projects = await prisma.projects.delete({
          where: {
            id: input.projectId,
          },
        });
        return backendRes({ ok: true, result: projects });
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
    .input(projectsZodSchema.create)
    .mutation(async ({ input }) => {
      try {
        const isDomainNameExist = await prisma.projects.findFirst({
          where: { domainName: input.domainName },
        });
        if (isDomainNameExist)
          throw new Error(
            "Domain name already exist, Please try with different one."
          );
        const project = await prisma.projects.create({
          data: {
            name: input.name,
            repositoryUrl: input.repositoryUrl,
            buildCmd: input.buildCmd,
            installCmd: input.installCmd,
            runCmd: input.runCmd,
            userId: input.userId,
            envs: input.envs,
            domainName: input.domainName,
          },
        });
        return backendRes({ ok: true, result: project });
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
