import { appRouter } from "@repo/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import dotenv from "dotenv";
import express from "express";
import mime from "mime";
import stripAnsi from "strip-ansi";

import { prisma } from "@repo/database";
import { toNodeHandler } from "better-auth/node";
import { spawn } from "child_process";
import cors from "cors";
import { existsSync } from "fs";
import path from "path";
import { send } from "process";
import simpleGit from "simple-git";
import { Readable } from "stream";
import { fileURLToPath } from "url";
import { auth } from "./lib/auth";
import { getS3Object, uploadFileToS3 } from "./lib/aws";
import { getAllFiles } from "./lib/utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const app = express();
app.use(
  cors({
    origin: [process.env.VITE_WEB_BASE_URL!],
    credentials: true,
  })
);
app.all("/api/auth/*any", toNodeHandler(auth));
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

app.use(express.json());
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

// app.get("/", async (req, res) => {
//   res.redirect(process.env.VITE_WEB_BASE_URL);
// });

app.get("/trigger-deploy", async (req, res) => {
  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const logs: string[] = []; // ← Accumulate logs here

    const send = (msg: string) => {
      const lines = stripAnsi(msg).split("\n");
      for (const line of lines) {
        res.write(`data: ${line}\n`);
        logs.push(line);
      }
      res.write("\n"); // <- marks end of one SSE message
    };

    const deploymentId = req.query.deploymentId as string;

    if (!deploymentId) throw new Error("Invalid deploymentId");

    const deployment = await prisma.deployments.findUnique({
      where: { id: deploymentId as string },
      include: { project: true },
    });
    if (!deployment) throw new Error("Project not found");

    if (deployment.status !== "Building") {
      if (deployment.logs) {
        const oldLogs = deployment.logs.split("\n");
        oldLogs.forEach((line) => {
          send(line);
        });
        send(`data: End`);
      } else {
        send(`data: No logs available`);
        send(`data: End`);
      }
      res.end();
      return;
    }

    console.log("status", deployment.status);

    await prisma.deployments.update({
      where: { id: deploymentId },
      data: { status: "Building" },
    });
    const projectPath = path.resolve(
      "../../buildFolder",
      deployment.project.id
    );

    if (!existsSync(projectPath)) {
      await simpleGit().clone(deployment.project.repositoryUrl, projectPath);
    }

    await new Promise((resolve, reject) => {
      const install = spawn(deployment.project.installCmd, {
        cwd: projectPath,
        shell: true,
      });
      send(deployment.project.installCmd);
      install.stdout.on("data", (data) => send(data.toString()));
      install.stderr.on("data", (data) => send(`ERROR: ${data.toString()}`));
      install.on("close", (code) => {
        if (code !== 0) return reject(new Error("npm install failed"));
        resolve(code);
      });
    });

    send(deployment.project.buildCmd);

    await new Promise((resolve, reject) => {
      const build = spawn(deployment.project.buildCmd, {
        cwd: projectPath,
        shell: true,
      });
      build.stdout.on("data", (data) => send(data.toString()));
      build.stderr.on("data", (data) => send(`ERROR: ${data.toString()}`));
      build.on("close", async (code) => {
        if (code !== 0) return reject(new Error("npm build failed"));
        await prisma.deployments.update({
          where: { id: deploymentId },
          data: { status: "Ready" },
        });
        resolve(code);
      });
    });

    send("Build completed successfully.");
    send("End");
    await prisma.deployments.update({
      where: { id: deploymentId },
      data: {
        logs: logs.join("\n"),
      },
    });
    const allFiles = getAllFiles(path.join(projectPath, "dist"));
    console.log({ allFiles });

    allFiles.forEach(async (file) => {
      await uploadFileToS3(
        deployment.projectId + file.slice(projectPath.length + 5),
        file
      );
    });
    res.end();
  } catch (error) {
    console.error(error);
    await prisma.deployments.update({
      where: { id: req.query.deploymentId as string },
      data: { status: "Error" },
    });
    send("End");
    res.end();
  }
});

app.get("{*any}", async (req, res) => {
  const host = req.hostname; // e.g. project123.racle.com

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
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log("server listening on ", PORT));
