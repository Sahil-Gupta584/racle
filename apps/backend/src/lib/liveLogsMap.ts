// apps/backend/src/lib/liveLogsMap.ts
const liveLogsMap = new Map<string, string[]>();

export function initLiveLogs(deploymentId: string) {
  const logs: string[] = [];
  liveLogsMap.set(deploymentId, logs);
  return logs;
}

export function getLiveLogs(deploymentId: string): string[] {
  return liveLogsMap.get(deploymentId) || [];
}

export function clearLiveLogs(deploymentId: string) {
  liveLogsMap.delete(deploymentId);
}
