import { createAuthClient } from "better-auth/react";
import { backendUrl } from "./utils";

const authClient = createAuthClient({
  baseURL: backendUrl + "/api/auth",
});

export const { signIn, signUp, useSession, signOut } = authClient;
