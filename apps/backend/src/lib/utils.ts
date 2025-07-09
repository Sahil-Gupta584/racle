import { prisma } from "@repo/database";
import { spawn } from "child_process";
import fs from "fs";
import fsPromise from "fs/promises";
import path from "path";
import simpleGit from "simple-git";
import stripAnsi from "strip-ansi";
import { uploadFileToS3 } from "./aws";
import { clearLiveLogs, initLiveLogs } from "./liveLogsMap";
import { deleteLogStream, getOrCreateLogStream } from "./logStream";

export function getAllFiles(folderPath: string) {
  let filePaths: string[] = [];
  const filesAndFolders = fs.readdirSync(folderPath);
  filesAndFolders.forEach((file) => {
    const fullPath = path.join(folderPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      filePaths = filePaths.concat(getAllFiles(fullPath));
    } else {
      filePaths.push(fullPath);
    }
  });
  return filePaths;
}

export async function verifySignature(secret: string, header: string, payload) {
  let encoder = new TextEncoder();
  let parts = header.split("=");
  let sigHex = parts[1];

  let algorithm = { name: "HMAC", hash: { name: "SHA-256" } };

  let keyBytes = encoder.encode(secret);
  let extractable = false;
  let key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    algorithm,
    extractable,
    ["sign", "verify"],
  );

  let sigBytes = hexToBytes(sigHex);
  let dataBytes = encoder.encode(payload);
  let equal = await crypto.subtle.verify(
    algorithm.name,
    key,
    sigBytes,
    dataBytes,
  );

  return equal;
}

function hexToBytes(hex: string) {
  let len = hex.length / 2;
  let bytes = new Uint8Array(len);

  let index = 0;
  for (let i = 0; i < hex.length; i += 2) {
    let c = hex.slice(i, i + 2);
    let b = parseInt(c, 16);
    bytes[index] = b;
    index += 1;
  }

  return bytes;
}

async function removeProjectDir(projectPath: string) {
  await fsPromise.rm(projectPath, {
    recursive: true,
    force: true,
  });
}
export async function buildAndDeployProject(
  deploymentId: string,
  projectId: string,
) {
  const projectPath = path.resolve("../../buildFolder", projectId);
  try {
    console.log("Started Deploying", deploymentId);

    const logs = initLiveLogs(deploymentId); // ✅ call before logging
    const emitter = getOrCreateLogStream(deploymentId);

    const log = (msg: string) => {
      const lines = stripAnsi(msg).split("\n");
      for (const line of lines) {
        emitter.emit("log", line);
        console.log("log:", line);

        logs.push(line);
      }
    };

    const deployment = await prisma.deployments.findUnique({
      where: { id: deploymentId },
      include: { project: true },
    });
    if (!deployment) throw new Error("Deployment not found");

    if (deployment.status === "Ready") {
      log("Already built.");
      return;
    }

    await prisma.deployments.update({
      where: { id: deploymentId },
      data: { status: "Building" },
    });

    if (!fs.existsSync(projectPath)) {
      await simpleGit().clone(deployment.project.repositoryUrl, projectPath);
    }

    // install
    await new Promise((resolve, reject) => {
      const install = spawn(deployment.project.installCmd, {
        cwd: projectPath,
        shell: true,
      });
      log(deployment.project.installCmd);
      install.stdout.on("data", (data) => log(data.toString()));
      install.stderr.on("data", (data) => log(`ERROR: ${data.toString()}`));
      install.on("close", (code) => {
        if (code !== 0) return reject(new Error("Install failed"));
        resolve(code);
      });
    });

    // build
    log(deployment.project.buildCmd);
    await new Promise((resolve, reject) => {
      const build = spawn(deployment.project.buildCmd, {
        cwd: projectPath,
        shell: true,
      });
      build.stdout.on("data", (data) => log(data.toString()));
      build.stderr.on("data", (data) => log(`ERROR: ${data.toString()}`));

      build.on("error", (err) => {
        log(`Spawn error: ${err.message}`);
        reject(err); // ← This was missing!
      });

      build.on("close", async (code) => {
        if (code !== 0) {
          log(`Build process exited with code ${code}`);
          log(`End`);
          deleteLogStream(deploymentId);
          clearLiveLogs(deploymentId); // ✅ cleanup

          await prisma.deployments.update({
            where: { id: deploymentId },
            data: {
              logs: logs.join("\n"),
              status: "Error",
            },
          });
          return reject(new Error("Build failed"));
        }
      });
    });

    //remove project src directory
    await fsPromise.rm(path.join(projectPath, "src"), {
      recursive: true,
      force: true,
    });
    //remove project directory
    await removeProjectDir(projectPath);
    //upload build files to s3
    const allFiles = getAllFiles(path.join(projectPath, "dist"));
    for (const file of allFiles) {
      await uploadFileToS3(
        deployment.projectId + file.slice(projectPath.length + 5),
        file,
      );
    }

    //save logs to db
    await prisma.deployments.update({
      where: { id: deploymentId },
      data: {
        logs: logs.join("\n"),
      },
    });

    console.log("Completed Deploying", deploymentId);
    deleteLogStream(deploymentId);
    clearLiveLogs(deploymentId); // ✅ cleanup
  } catch (error) {
    await removeProjectDir(projectPath);
    console.log("error in buildAnDeploy", error);
  }
}
