import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@esign/db'
import bcrypt from 'bcryptjs'
import speakeasy from 'speakeasy'
import { decryptFromString } from '@esign/crypto'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        totpCode: { label: 'MFA Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.isActive) return null

        const validPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )
        if (!validPassword) return null

        if (user.totpEnabled && user.totpSecret) {
          if (!credentials.totpCode) return null

          const secret = decryptFromString(user.totpSecret)

          const valid = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token: credentials.totpCode,
            window: 2,
          })

          if (!valid) return null
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          plan: user.plan,
          totpEnabled: user.totpEnabled,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.plan = user.plan
        token.totpEnabled = user.totpEnabled
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.plan = token.plan
        session.user.totpEnabled = token.totpEnabled
      }
      return session
    },
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 15 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
}