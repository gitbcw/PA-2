"use client";


import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/components/auth/AuthProvider";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 如果用户已登录，重定向到首页
  useEffect(() => {
    if (status === "authenticated") {
      console.log("User already authenticated in login layout, redirecting to home");
      const searchParams = new URLSearchParams(window.location.search);
      const callbackUrl = searchParams.get("callbackUrl") || "/";
      router.push(callbackUrl);
    }
  }, [status, router]);

  return (
    <html lang="en">
      <head>
        <title>登录 - PDCA 个人助手</title>
        <meta
          name="description"
          content="登录到 PDCA 个人助手"
        />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
