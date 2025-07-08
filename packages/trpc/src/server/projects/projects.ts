import { Octokit } from "@octokit/rest";
import { prisma } from "@repo/database";
import { backendRes, getLatestCommitInfo } from "../../helpers";
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
            "Domain name already exists, please try a different one."
          );

        const user = await prisma.account.findFirst({
          where: { userId: input.userId, providerId: "github" },
        });
        if (user) {
          const octokit = new Octokit({
            auth: user.accessToken,
          });

          const match = input.repositoryUrl.match(
            /github\.com\/([^\/]+)\/([^\/]+)/
          );
          if (!match) throw new Error("Invalid GitHub repo URL");
          const [_, owner, repo] = match;

          // Create webhook
          // const res = await octokit.repos.createWebhook({
          //   owner: owner as string,
          //   repo: repo as string,
          //   config: {
          //     url: "https://951c315910a3.ngrok-free.app/github-webhook", // Update with your actual domain
          //     content_type: "json",
          //     secret: "mysecret",
          //     insecure_ssl: "0",
          //   },
          //   events: ["push"],
          // });
          // console.log({ res: JSON.stringify(res.data) });
        }
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
            autoDeploy: !!user,
          },
        });

        const commitInfo = await getLatestCommitInfo(project.repositoryUrl);
        if (!commitInfo) throw new Error("Failed to fetch latest commit hash");

        const deployment = await prisma.deployments.create({
          data: {
            projectId: project.id,
            commitHash: commitInfo.hash || "Unknown",
            commitMessage: commitInfo.message || "Unknown",
            status: "Queued",
          },
        });
        return backendRes({ ok: true, result: { project, deployment } });
      } catch (error) {
        console.error("Error creating project", error);
        return backendRes({
          ok: false,
          error: (error as Error).message,
          result: null,
        });
      }
    }),
  toggleAutoDeploy: trpcProcedure
    .input(projectsZodSchema.toggleAutoDeploy)
    .mutation(async ({ input }) => {
      try {
        const project = await prisma.projects.update({
          where: {
            id: input.projectId,
          },
          data: {
            autoDeploy: input.autoDeploy,
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
