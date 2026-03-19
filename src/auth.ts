import { NextAuthOptions, getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
// prisma adapter not required for JWT sessions but can be enabled if desired
// import { PrismaAdapter } from "@auth/prisma-adapter"
import { logAppError } from "@/lib/observability"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const isProduction = process.env.NODE_ENV === "production"

function resolveAndValidateAuthSecret() {
  const authSecret = process.env.AUTH_SECRET?.trim()
  const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim()

  if (authSecret && nextAuthSecret && authSecret !== nextAuthSecret) {
    const message =
      "AUTH_SECRET y NEXTAUTH_SECRET difieren. Deben ser iguales para evitar firmas inconsistentes."
    if (isProduction) {
      throw new Error(message)
    }
    console.warn(message)
  }

  const resolvedSecret = authSecret || nextAuthSecret
  if (!resolvedSecret || resolvedSecret.length < 32) {
    const message =
      "NEXTAUTH_SECRET/AUTH_SECRET es debil o ausente. Usa un valor fuerte (>=32 caracteres)."
    if (isProduction) {
      throw new Error(message)
    }
    console.warn(message)
  }

  return resolvedSecret
}

const authSecret = resolveAndValidateAuthSecret()

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
        try {
          if (!credentials?.email || !credentials.password) {
            logAppError("auth.login.invalid_credentials", "Missing email or password", undefined, "warn")
            return null
          }

          const normalizedEmail = credentials.email.toLowerCase()
          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          })

          if (!user || !user.passwordHash || user.mustSetPassword) {
            logAppError("auth.login.invalid_credentials", "User missing, inactive or pending setup", undefined, "warn")
            return null
          }

          const valid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!valid) {
            logAppError("auth.login.invalid_credentials", "Password mismatch", undefined, "warn")
            return null
          }

          // restrict the object returned to the fields you want in the token
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          logAppError("auth.login", error)
          return null
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

      if (!token.email) {
        return token
      }

      const dbUser = await prisma.user.findUnique({
        where: { email: token.email },
        select: {
          id: true,
          email: true,
          role: true,
          passwordHash: true,
          mustSetPassword: true,
        },
      })

      if (!dbUser || !dbUser.passwordHash || dbUser.mustSetPassword) {
        // Invalida sesiones viejas de usuarios eliminados o no activados.
        return {}
      }

      token.id = dbUser.id
      token.email = dbUser.email
      token.role = dbUser.role

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
  secret: authSecret,
  // adapter: PrismaAdapter(prisma), // uncomment if you switch to database sessions
}

// helper for server components/layouts
export const getAuthSession = () => getServerSession(authOptions)
