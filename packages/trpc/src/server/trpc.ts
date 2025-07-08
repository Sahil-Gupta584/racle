import { initTRPC } from "@trpc/server";

const t = initTRPC.create();
export const trpcProcedure = t.procedure;
export const trpcRouter = t.router;
