import { NextAuthOptions, getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
// prisma adapter not required for JWT sessions but can be enabled if desired
// import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

function validateNextAuthSecret(secret: string | undefined) {
  if (!secret || secret.length < 32) {
    console.warn(
      "NEXTAUTH_SECRET es débil o ausente. Debes usar un valor fuerte (>=32 caracteres) para seguridad.",
    )
  }
}

validateNextAuthSecret(process.env.NEXTAUTH_SECRET)

// centralised NextAuth configuration so it can be shared between the API route
// and pages/components that need the session on the server
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })

        if (!user || !user.passwordHash || user.mustSetPassword) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        // restrict the object returned to the fields you want in the token
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = user.role
        return token
      }

      // Backfill missing fields for old JWT sessions created before role/id were stored.
      if ((!token.role || !token.id) && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            email: true,
            role: true,
          },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.email = dbUser.email
          token.role = dbUser.role
        }
      }

      return token
    },
    async session({ session, token }) {
      const id = token.id ?? token.sub
      const email = token.email
      const role = token.role

      if (!id || !email || !role) {
        return session
      }

      if (!session.user) {
        session.user = {
          id,
          email,
          role,
          name: token.name ?? null,
          image: null,
        }
      } else {
        session.user.id = id
        session.user.email = email
        session.user.role = role
      }

      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  // adapter: PrismaAdapter(prisma), // uncomment if you switch to database sessions
}

// helper for server components/layouts
export const getAuthSession = () => getServerSession(authOptions)
