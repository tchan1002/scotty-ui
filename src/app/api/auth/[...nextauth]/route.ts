import NextAuth, { type NextAuthOptions, type Session } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { type JWT } from "next-auth/jwt";

// helper types to avoid `any`
type TokenWithAccess = JWT & { accessToken?: string | null };
type SessionWithAccess = Session & { accessToken?: string | null };

const options: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: { params: { scope: "read:user repo" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }): Promise<TokenWithAccess> {
      const t: TokenWithAccess = { ...token };
      if (account?.access_token) {
        t.accessToken = account.access_token;
      }
      return t;
    },
    async session({ session, token }): Promise<SessionWithAccess> {
      const s: SessionWithAccess = { ...session, accessToken: null };
      s.accessToken = (token as TokenWithAccess).accessToken ?? null;
      return s;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
