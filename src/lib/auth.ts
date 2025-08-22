// src/lib/auth.ts
import type { NextAuthOptions, Session } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import type { JWT } from "next-auth/jwt";

type TokenWithExtra = JWT & { accessToken?: string | null };
export type SessionWithExtra = Session & {
  accessToken?: string | null;
  userId?: string | null; // GitHub user id from token.sub
};

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: { params: { scope: "read:user repo" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }): Promise<TokenWithExtra> {
      const t: TokenWithExtra = { ...token };
      if (account?.access_token) t.accessToken = account.access_token;
      return t;
    },
    async session({ session, token }): Promise<SessionWithExtra> {
      return {
        ...session,
        accessToken: (token as TokenWithExtra).accessToken ?? null,
        userId: token.sub ?? null, // GitHub numeric id as string
      };
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
