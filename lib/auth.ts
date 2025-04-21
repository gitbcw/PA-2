import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

// 定义 NextAuth 配置
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          // 查找用户
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }

          // 简单密码比较（在生产环境中应使用哈希）
          const isPasswordValid = credentials.password === user.password;

          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email);
            return null;
          }

          console.log("User authenticated successfully:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email.split("@")[0],
          };
        } catch (error) {
          console.error("Error in authorize callback:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        console.log("JWT callback - Token created for user:", user.email);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        console.log("Session callback - Session created for user:", session.user.email);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback - URL:", url, "Base URL:", baseUrl);

      // 如果 URL 是相对路径，则将其转换为绝对路径
      if (url.startsWith("/")) {
        const absoluteUrl = `${baseUrl}${url.substring(1)}`;
        console.log("Converting relative URL to absolute:", absoluteUrl);
        return absoluteUrl;
      }

      // 如果 URL 已经是绝对路径，则直接返回
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // 否则返回基础 URL
      console.log("Redirecting to base URL:", baseUrl);
      return baseUrl;
    },
  },
};
