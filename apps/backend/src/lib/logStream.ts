// lib/logStream.ts
import { EventEmitter } from "events";

const logStreams = new Map<string, EventEmitter>();

export function getOrCreateLogStream(id: string) {
  if (!logStreams.has(id)) {
    logStreams.set(id, new EventEmitter());
  }
  return logStreams.get(id)!;
}

export function deleteLogStream(id: string) {
  logStreams.delete(id);
}
