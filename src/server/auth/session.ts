import "server-only";

import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE } from "@/lib/auth/constants";
import { JwtAuthProvider } from "./JwtAuthProvider";

const authProvider = new JwtAuthProvider();

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return authProvider.getUserFromToken(token);
}
