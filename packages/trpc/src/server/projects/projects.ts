import { Octokit } from "@octokit/rest";
import { prisma } from "@repo/database";

import {
  backendRes,
  getLatestCommitInfo,
  parseGitHubRepoUrl,
  webhook_secret,
} from "../../helpers";
import { trpcProcedure, trpcRouter } from "../trpc";
import { projectsZodSchema } from "./projectsZodSchema";

export const projectsRouter = trpcRouter({
  getAll: trpcProcedure.query(async () => {
    try {
      const projects = await prisma.projects.findMany({
        include: {
          _count: { select: { deployments: true } },
          deployments: { orderBy: { createdAt: "desc" }, take: 1 },
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
        const isRepositoryExists = await prisma.projects.findFirst({
          where: { repositoryUrl: input.repositoryUrl },
        });
        if (isRepositoryExists)
          throw new Error(
            "A project with the given repository url already exists please try different one."
          );
        const account = await prisma.account.findFirst({
          where: { userId: input.userId, providerId: "github" },
        });

        let hookId: number | null = null;
        const commitInfo = await getLatestCommitInfo(input.repositoryUrl);
        if (!commitInfo) throw new Error("Failed to fetch latest commit hash");

        if (account) {
          const octokit = new Octokit({
            auth: account.accessToken,
          });
          const parsedData = parseGitHubRepoUrl(input.repositoryUrl);
          if (!parsedData) throw "Failed to get repo info";

          const repo = await octokit.repos.get({
            owner: parsedData.owner,
            repo: parsedData.repo,
          });

          if (repo.data.permissions?.admin) {
            if (!webhook_secret)
              throw new Error("Github webhook secret not found");

            // await octokit.repos.deleteWebhook({
            //   hook_id: 560313287,
            //   owner: parsedData.owner,
            //   repo: parsedData.repo,
            // });
            // const hooksRes = await octokit.repos.listWebhooks({
            //   owner: parsedData.owner,
            //   repo: parsedData.repo,
            // });
            // console.log({ hooksRes: JSON.stringify(hooksRes.data) });

            const res = await octokit.repos.createWebhook({
              owner: parsedData.owner,
              repo: parsedData.repo,
              config: {
                url: "https://2fbc9fd4275a.ngrok-free.app/github-webhook", // Update with your actual domain
                content_type: "json",
                secret: webhook_secret,
                insecure_ssl: "0",
              },
              events: ["push"],
            });
            hookId = res.data.id;
          }
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
            autoDeploy: !!account,
            hookId,
          },
        });

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
  read: trpcProcedure.input(projectsZodSchema.read).query(async ({ input }) => {
    try {
      const projects = await prisma.projects.findUnique({
        where: {
          id: input.projectId,
        },
        include: { deployments: { orderBy: { createdAt: "desc" } } },
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
        const isProjectExist = await prisma.projects.findUnique({
          where: { id: input.projectId },
          include: {
            user: {
              include: { accounts: { where: { providerId: "github" } } },
            },
          },
        });

        if (!isProjectExist)
          throw new Error(
            `project not found to delete projectId:${input.projectId}`
          );

        const parsedData = parseGitHubRepoUrl(isProjectExist.repositoryUrl);
        if (!parsedData) throw "Failed to get repo info";
        if (
          isProjectExist.user.accounts &&
          isProjectExist.user.accounts[0] &&
          isProjectExist.hookId
        ) {
          const octokit = new Octokit({
            auth: isProjectExist.user.accounts[0].accessToken,
          });
          await octokit.repos.deleteWebhook({
            hook_id: isProjectExist.hookId,
            owner: parsedData.owner,
            repo: parsedData.repo,
          });
        }
        const project = await prisma.projects.delete({
          where: {
            id: input.projectId,
          },
          include: {
            user: {
              include: { accounts: { where: { providerId: "github" } } },
            },
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
  toggleAutoDeploy: trpcProcedure
    .input(projectsZodSchema.toggleAutoDeploy)
    .mutation(async ({ input }) => {
      try {
        const isProjectExist = await prisma.projects.findFirst({
          where: {
            id: input.projectId,
          },
          include: {
            user: {
              include: { accounts: { where: { providerId: "github" } } },
            },
          },
        });
        if (!isProjectExist)
          throw new Error(`Project not found projectId:${input.projectId}`);

        if (!isProjectExist.user.accounts || !isProjectExist.user.accounts[0])
          throw new Error(
            "Please login with Github provider so we can add enable auto deployment on you repository."
          );

        const octokit = new Octokit({
          auth: isProjectExist.user.accounts[0].accessToken,
        });

        const parsedData = parseGitHubRepoUrl(isProjectExist.repositoryUrl);
        if (!parsedData) throw "Failed to get repo info";
        const repo = await octokit.repos.get({
          owner: parsedData.owner,
          repo: parsedData.repo,
        });
        if (!repo.data.permissions?.admin)
          throw new Error(
            "Auto deployment can be enabled for the repo you own."
          );

        if (!webhook_secret) throw new Error("Github webhook secret not found");

        let hookId: null | number = null;
        if (input.autoDeploy) {
          const createRes = await octokit.repos.createWebhook({
            owner: parsedData.owner,
            repo: parsedData.repo,
            config: {
              secret: webhook_secret,
              url: "https://2fbc9fd4275a.ngrok-free.app/github-webhook",
              content_type: "json",
              insecure_ssl: "0",
            },
          });
          hookId = createRes.data.id;
        }

        if (!input.autoDeploy && isProjectExist.hookId) {
          await octokit.repos.deleteWebhook({
            hook_id: isProjectExist.hookId,
            owner: parsedData.owner,
            repo: parsedData.repo,
          });
        }

        const project = await prisma.projects.update({
          where: {
            id: input.projectId,
          },
          data: {
            autoDeploy: input.autoDeploy,
            hookId,
          },
        });
        return backendRes({ ok: true, result: project });
      } catch (error) {
        console.error("Error in toggleAutoDeploy", error);
        return backendRes({
          ok: false,
          error: (error as Error).message,
          result: null,
        });
      }
    }),
});
