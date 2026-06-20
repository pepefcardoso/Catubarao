import { createAuthClient } from "better-auth/react";
import { adminClient, jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  plugins: [
    adminClient(),
    jwtClient(),
  ],
});

export const { signIn, signUp, useSession } = authClient;
