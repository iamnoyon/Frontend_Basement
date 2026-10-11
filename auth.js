import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { siteConfig } from "./config/siteConfig";

// The backend's access token lives 24h (expires_in: 86400), so the session shouldn't outlive it.
const SESSION_MAX_AGE = 60 * 60 * 24;


export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            `${siteConfig.baseUrl}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          // { success, message, data: { access_token, token_type, expires_in, user: { id, full_name, email, role } } }
          const data = await res.json();
          const accessToken = data?.data?.access_token;

          if (!res.ok || !data?.success || !accessToken) {
            return null;
          }

          const user = data.data.user;

          return {
            id: String(user?.id),
            name: user?.full_name,
            email: user?.email,
            image: user?.profileImageUrl ?? null,
            role: user?.role,
            token: accessToken,
            // Absolute expiry of the backend token (expires_in is in seconds).
            tokenExpiresAt: Date.now() + (Number(data.data.expires_in) || SESSION_MAX_AGE) * 1000,
            permissions: user?.permissions ?? null,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.backendToken = user.token;
        token.profileImageUrl = user.image;
        token.permissions = user.permissions;
        token.tokenExpiresAt = user.tokenExpiresAt;
      }
      // Backend token expired: end the session so the user signs in again.
      if (token.tokenExpiresAt && Date.now() >= token.tokenExpiresAt) {
        return null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.backendToken = token.backendToken;
        session.user.profileImageUrl = token.profileImageUrl;
        session.user.permissions = token.permissions;
      }
      return session;
    },
  },
});
