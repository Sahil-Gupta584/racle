import { prisma } from "@repo/database";
import { appRouter } from "@repo/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mime from "mime";
import path from "path";
import { Readable } from "stream";
import stripAnsi from "strip-ansi";
import { fileURLToPath } from "url";
import { auth } from "./lib/auth";
import { getS3Object } from "./lib/aws";
import { deployProject, verifySignature } from "./lib/utils";

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

    const deploymentId = req.query.deploymentId as string;
    if (!deploymentId) throw new Error("Invalid deploymentId");

    const send = (msg: string) => {
      const lines = stripAnsi(msg).split("\n");
      for (const line of lines) {
        res.write(`data: ${line}\n`);
      }
      res.write("\n");
    };

    await deployProject(deploymentId, send);
    send("End");
    res.end();
  } catch (error) {
    console.error(error);
    res.end();
  }
});

app.post("/github-webhook", async (req, res) => {
  try {
    console.log(req.hostname, req.url);

    console.log("headers", req.headers);
    const signature = req.headers["x-hub-signature-256"] as string;
    const webhook_secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!signature)
      throw new Error("Webhook signature not available in headers ");

    if (!verifySignature(webhook_secret, signature, req.body))
      throw new Error("Invalid signature");

    const event = req.headers["x-github-event"];
    if (event === "push") {
      const repoName = req.body.repository.full_name;

      // find deployment for this repo
      const deployment = await prisma.deployments.findFirst({
        where: {
          project: {
            repositoryUrl: {
              contains: repoName, // You may need to adjust this
            },
          },
        },
        include: { project: true },
      });

      if (!deployment) throw new Error("No matching deployment");

      await deployProject(deployment.id); // ← Triggers deployment

      res.status(200).send("Triggered deployment");
    } else {
      res.status(200).send("Ignored event");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Webhook failed");
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
