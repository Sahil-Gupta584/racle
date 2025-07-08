import { deploymentRouter } from "./deployment/deployment.js";
import { projectsRouter } from "./projects/projects.js";
import { trpcRouter } from "./trpc.js";

export const appRouter = trpcRouter({
  projects: projectsRouter,
  deployment: deploymentRouter,
});
export type AppRouter = typeof appRouter;
