import { prisma } from "@repo/database";
import { getS3Object } from "@repo/lib/aws";
import { env } from "@repo/lib/envs";
import { appRouter } from "@repo/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import mime from "mime";
import { Readable } from "stream";
import { enqueueBuild } from "./buildWorker";
import { auth } from "./lib/auth";
import { getLiveLogs } from "./lib/liveLogsMap";
import { getOrCreateLogStream } from "./lib/logStream";
import { tryCatch } from "./lib/tryCatchWrapper";
import { verifySignature } from "./lib/utils";
const app = express();
app.use(
  cors({
    origin: [env.VITE_WEB_BASE_URL!],
    credentials: true,
  })
);
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});
app.all("/api/auth/*any", toNodeHandler(auth));

app.use(express.json());
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

app.get(
  "/get-logs",
  tryCatch(async (req, res) => {
    const deploymentId = req.query.deploymentId as string;
    if (!deploymentId) throw new Error("Missing deploymentId");

    const deployment = await prisma.deployments.findUnique({
      where: { id: deploymentId },
    });
    if (!deployment)
      throw new Error(`Deployment not found for ${deploymentId}`);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const send = (line: string) => {
      res.write(`data: ${line}\n\n`);
    };

    if (deployment.status === "Ready" || deployment.status === "Error") {
      deployment.logs.split("\n").forEach(send);

      res.end();
    }
    const pastLogs = getLiveLogs(deploymentId);
    pastLogs.forEach(send);
    const emitter = getOrCreateLogStream(deploymentId);
    emitter.on("log", send);

    req.on("close", () => {
      emitter.removeListener("log", send);
    });
  })
);

app.get(
  "/trigger-deploy",
  tryCatch(async (req, res) => {
    const deploymentId = req.query.deploymentId as string;
    if (!deploymentId) throw new Error("deploymentId is required.");

    // if build already started, don't start again
    const deployment = await prisma.deployments.findUnique({
      where: { id: deploymentId },
    });
    if (!deployment)
      throw new Error(`deployment not found for deploymentId:${deploymentId}`);

    if (deployment?.status !== "Building") {
      enqueueBuild({
        deploymentId: deployment.id,
        projectId: deployment.projectId,
      });
    }
    res.json({ ok: true });
  })
);

app.post(
  "/github-webhook",
  tryCatch(async (req, res) => {
    const signature = req.headers["x-hub-signature-256"] as string;
    const webhook_secret = env.GITHUB_WEBHOOK_SECRET;

    if (!signature) throw new Error("Signature missing");

    if (!verifySignature(webhook_secret, signature, req.body))
      throw new Error("Invalid signature");

    const event = req.headers["x-github-event"];
    console.log({ event });

    if (event === "push") {
      const repoUrl = req.body.repository.html_url;
      if (!repoUrl) throw "repoUrl not found";
      const project = await prisma.projects.findFirst({
        where: {
          repositoryUrl: repoUrl,
        },
      });

      if (!project) throw new Error(`project not found for ${repoUrl}`);
      if (!project.autoDeploy)
        throw new Error(`AutoDeploy is disabled for ${repoUrl}`);

      const commits = req.body.commits;
      const latestCommit =
        Array.isArray(commits) && commits.length === 1
          ? commits.sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )[0]
          : null;
      if (!latestCommit.id || !latestCommit.message)
        throw new Error(`Invalid commit payload for projectId:${project.id}`);

      const deployment = await prisma.deployments.create({
        data: {
          commitHash: latestCommit.id,
          commitMessage: latestCommit.message,
          projectId: project.id,
          status: "Queued",
        },
      });
      enqueueBuild({
        deploymentId: deployment.id,
        projectId: deployment.projectId,
      });
      res.status(200).send("Triggered deployment");
    } else {
      res.status(200).send("Ignored event");
    }
  })
);

app.get("{*any}", async (req, res) => {
  try {
    const host = req.hostname;

    const subdomain = host.split(".")[0];

    const project = await prisma.projects.findFirst({
      where: { domainName: subdomain },
    });

    if (!project) {
      res.status(404).send("Project not found");
      return;
    }
    const filePath = req.path === "/" ? "index.html" : req.path.slice(1); // remove leading "/"
    const type = filePath.endsWith("html")
      ? "text/html"
      : filePath.endsWith("css")
        ? "text/css"
        : filePath.endsWith("svg")
          ? "image/svg+xml"
          : "application/javascript";

    const key = `${project.id}/${filePath}`;

    const fileBody = await getS3Object(key);

    if (!fileBody?.Body) {
      res.status(500).send("Failed to load Body");
      return;
    }

    // Automatically detect and set MIME type
    const contentType = mime.getType(filePath) || "application/octet-stream";
    console.log({ contentType });
    res.setHeader("Content-Type", contentType);
    if (fileBody.Body instanceof Readable) {
      fileBody.Body.pipe(res);
    } else {
      res.send(fileBody.Body);
    }
  } catch (error) {
    console.log("Error to serve project", error);
    res.send("Error to serve project");
  }
});

const PORT = env.PORT;
app.listen(PORT, "0.0.0.0", () => console.log("server listening on ", PORT));
