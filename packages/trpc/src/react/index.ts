import { createTRPCReact } from "@trpc/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../server/router.ts";

export const backend: ReturnType<typeof createTRPCReact<AppRouter>> =
  createTRPCReact<AppRouter>();
export type TBackendInput = inferRouterInputs<AppRouter>;
export type TBackendOutput = inferRouterOutputs<AppRouter>;
