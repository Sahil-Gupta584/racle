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
import { fileURLToPath } from "url";
import { enqueueBuild } from "./buildWorker";
import { auth } from "./lib/auth";
import { getS3Object } from "./lib/aws";
import { getLiveLogs } from "./lib/liveLogsMap";
import { getOrCreateLogStream } from "./lib/logStream";
import { tryCatch } from "./lib/tryCatchWrapper";
import { verifySignature } from "./lib/utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const app = express();
app.use(
  cors({
    origin: [process.env.VITE_WEB_BASE_URL!],
    credentials: true,
  }),
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
  }),
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
  }),
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
  }),
);

app.post(
  "/github-webhook",
  tryCatch(async (req, res) => {
    const signature = req.headers["x-hub-signature-256"] as string;
    const webhook_secret = process.env.GITHUB_WEBHOOK_SECRET;

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
                new Date(a.timestamp).getTime(),
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
      const data = {
        ref: "refs/heads/main",
        before: "f1afb497067b12e25fb64cc8133177375fb210f7",
        after: "ebf1d85b4aad2e85881a14ef31223ca7765bbfc4",
        repository: {
          id: 1012617117,
          node_id: "R_kgDOPFtPnQ",
          name: "vite-template",
          full_name: "Sahil-Gupta584/vite-template",
          private: false,
          owner: {
            name: "Sahil-Gupta584",
            email: "guptas3067@gmail.com",
            login: "Sahil-Gupta584",
            id: 134826929,
            node_id: "U_kgDOCAlLsQ",
            avatar_url: "https://avatars.githubusercontent.com/u/134826929?v=4",
            gravatar_id: "",
            url: "https://api.github.com/users/Sahil-Gupta584",
            html_url: "https://github.com/Sahil-Gupta584",
            followers_url:
              "https://api.github.com/users/Sahil-Gupta584/followers",
            following_url:
              "https://api.github.com/users/Sahil-Gupta584/following{/other_user}",
            gists_url:
              "https://api.github.com/users/Sahil-Gupta584/gists{/gist_id}",
            starred_url:
              "https://api.github.com/users/Sahil-Gupta584/starred{/owner}{/repo}",
            subscriptions_url:
              "https://api.github.com/users/Sahil-Gupta584/subscriptions",
            organizations_url:
              "https://api.github.com/users/Sahil-Gupta584/orgs",
            repos_url: "https://api.github.com/users/Sahil-Gupta584/repos",
            events_url:
              "https://api.github.com/users/Sahil-Gupta584/events{/privacy}",
            received_events_url:
              "https://api.github.com/users/Sahil-Gupta584/received_events",
            type: "User",
            user_view_type: "public",
            site_admin: false,
          },
          html_url: "https://github.com/Sahil-Gupta584/vite-template",
          description: null,
          fork: false,
          url: "https://api.github.com/repos/Sahil-Gupta584/vite-template",
          forks_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/forks",
          keys_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/keys{/key_id}",
          collaborators_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/collaborators{/collaborator}",
          teams_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/teams",
          hooks_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/hooks",
          issue_events_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/issues/events{/number}",
          events_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/events",
          assignees_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/assignees{/user}",
          branches_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/branches{/branch}",
          tags_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/tags",
          blobs_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/git/blobs{/sha}",
          git_tags_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/git/tags{/sha}",
          git_refs_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/git/refs{/sha}",
          trees_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/git/trees{/sha}",
          statuses_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/statuses/{sha}",
          languages_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/languages",
          stargazers_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/stargazers",
          contributors_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/contributors",
          subscribers_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/subscribers",
          subscription_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/subscription",
          commits_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/commits{/sha}",
          git_commits_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/git/commits{/sha}",
          comments_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/comments{/number}",
          issue_comment_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/issues/comments{/number}",
          contents_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/contents/{+path}",
          compare_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/compare/{base}...{head}",
          merges_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/merges",
          archive_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/{archive_format}{/ref}",
          downloads_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/downloads",
          issues_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/issues{/number}",
          pulls_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/pulls{/number}",
          milestones_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/milestones{/number}",
          notifications_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/notifications{?since,all,participating}",
          labels_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/labels{/name}",
          releases_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/releases{/id}",
          deployments_url:
            "https://api.github.com/repos/Sahil-Gupta584/vite-template/deployments",
          created_at: 1751471598,
          updated_at: "2025-07-09T12:26:41Z",
          pushed_at: 1752064279,
          git_url: "git://github.com/Sahil-Gupta584/vite-template.git",
          ssh_url: "git@github.com:Sahil-Gupta584/vite-template.git",
          clone_url: "https://github.com/Sahil-Gupta584/vite-template.git",
          svn_url: "https://github.com/Sahil-Gupta584/vite-template",
          homepage: null,
          size: 12,
          stargazers_count: 0,
          watchers_count: 0,
          language: "CSS",
          has_issues: true,
          has_projects: true,
          has_downloads: true,
          has_wiki: true,
          has_pages: false,
          has_discussions: false,
          forks_count: 0,
          mirror_url: null,
          archived: false,
          disabled: false,
          open_issues_count: 0,
          license: null,
          allow_forking: true,
          is_template: false,
          web_commit_signoff_required: false,
          topics: [],
          visibility: "public",
          forks: 0,
          open_issues: 0,
          watchers: 0,
          default_branch: "main",
          stargazers: 0,
          master_branch: "main",
        },
        pusher: { name: "Sahil-Gupta584", email: "guptas3067@gmail.com" },
        sender: {
          login: "Sahil-Gupta584",
          id: 134826929,
          node_id: "U_kgDOCAlLsQ",
          avatar_url: "https://avatars.githubusercontent.com/u/134826929?v=4",
          gravatar_id: "",
          url: "https://api.github.com/users/Sahil-Gupta584",
          html_url: "https://github.com/Sahil-Gupta584",
          followers_url:
            "https://api.github.com/users/Sahil-Gupta584/followers",
          following_url:
            "https://api.github.com/users/Sahil-Gupta584/following{/other_user}",
          gists_url:
            "https://api.github.com/users/Sahil-Gupta584/gists{/gist_id}",
          starred_url:
            "https://api.github.com/users/Sahil-Gupta584/starred{/owner}{/repo}",
          subscriptions_url:
            "https://api.github.com/users/Sahil-Gupta584/subscriptions",
          organizations_url: "https://api.github.com/users/Sahil-Gupta584/orgs",
          repos_url: "https://api.github.com/users/Sahil-Gupta584/repos",
          events_url:
            "https://api.github.com/users/Sahil-Gupta584/events{/privacy}",
          received_events_url:
            "https://api.github.com/users/Sahil-Gupta584/received_events",
          type: "User",
          user_view_type: "public",
          site_admin: false,
        },
        created: false,
        deleted: false,
        forced: false,
        base_ref: null,
        compare:
          "https://github.com/Sahil-Gupta584/vite-template/compare/f1afb497067b...ebf1d85b4aad",
        commits: [
          {
            id: "ebf1d85b4aad2e85881a14ef31223ca7765bbfc4",
            tree_id: "88c43339c5b6d10c66148c6c011b602e49ac1849",
            distinct: true,
            message: "Update README.md",
            timestamp: "2025-07-09T18:01:18+05:30",
            url: "https://github.com/Sahil-Gupta584/vite-template/commit/ebf1d85b4aad2e85881a14ef31223ca7765bbfc4",
            author: {
              name: "Sahil Gupta",
              email: "guptas3067@gmail.com",
              username: "Sahil-Gupta584",
            },
            committer: {
              name: "GitHub",
              email: "noreply@github.com",
              username: "web-flow",
            },
            added: [],
            removed: [],
            modified: ["README.md"],
          },
        ],
        head_commit: {
          id: "ebf1d85b4aad2e85881a14ef31223ca7765bbfc4",
          tree_id: "88c43339c5b6d10c66148c6c011b602e49ac1849",
          distinct: true,
          message: "Update README.md",
          timestamp: "2025-07-09T18:01:18+05:30",
          url: "https://github.com/Sahil-Gupta584/vite-template/commit/ebf1d85b4aad2e85881a14ef31223ca7765bbfc4",
          author: {
            name: "Sahil Gupta",
            email: "guptas3067@gmail.com",
            username: "Sahil-Gupta584",
          },
          committer: {
            name: "GitHub",
            email: "noreply@github.com",
            username: "web-flow",
          },
          added: [],
          removed: [],
          modified: ["README.md"],
        },
      };
      enqueueBuild({
        deploymentId: deployment.id,
        projectId: deployment.projectId,
      });
      res.status(200).send("Triggered deployment");
    } else {
      res.status(200).send("Ignored event");
    }
  }),
);

app.get("{*any}", async (req, res) => {
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
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log("server listening on ", PORT));
