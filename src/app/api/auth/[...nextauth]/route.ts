import NextAuth from "next-auth"
import { authOptions } from "@/auth"

// The shared options object lives in src/auth.ts so we don't accidentally
// diverge when the configuration is needed in other places (e.g. server
// components or tests).  The API route is just a thin wrapper that passes the
// object to NextAuth.

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }