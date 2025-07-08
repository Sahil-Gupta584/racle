import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL: "http:localhost:3000/api/auth",
});

export const { signIn, signUp, useSession, signOut } = authClient;
