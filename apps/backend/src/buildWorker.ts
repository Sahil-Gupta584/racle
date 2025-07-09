import { buildAndDeployProject } from "./lib/utils";

type BuildJob = {
  deploymentId: string;
  projectId: string;
};

const queue: BuildJob[] = [];
let isBuilding = false;

export function enqueueBuild(job: BuildJob) {
  queue.push(job);
  processQueue();
}

async function processQueue() {
  if (isBuilding || queue.length === 0) return;

  isBuilding = true;
  const job = queue.shift();
  if (!job) return;

  try {
    await buildAndDeployProject(job.deploymentId, job.projectId);
  } catch (err) {
    console.error("error in processQueue:", err);
  } finally {
    isBuilding = false;
    processQueue(); // Start next job in queue
  }
}
