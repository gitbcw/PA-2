import "./globals.css";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Sidebar } from "@/components/Sidebar";
import AuthProvider from "@/components/auth/AuthProvider";
import LogArchiveInitializer from "@/components/LogArchiveInitializer";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>PDCA 个人助手</title>
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <meta
          name="description"
          content="PDCA 个人助手 - 帮助您更好地规划、执行、检查和改进您的工作和生活"
        />
        <meta property="og:title" content="PDCA 个人助手" />
        <meta
          property="og:description"
          content="PDCA 个人助手 - 帮助您更好地规划、执行、检查和改进您的工作和生活"
        />
        <meta property="og:image" content="/images/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PDCA 个人助手" />
        <meta
          name="twitter:description"
          content="PDCA 个人助手 - 帮助您更好地规划、执行、检查和改进您的工作和生活"
        />
        <meta name="twitter:image" content="/images/og-image.png" />
      </head>
      <body>
        <AuthProvider>
          <NuqsAdapter>
            <div className="flex h-[100dvh] overflow-hidden">
              {/* Sidebar */}
              <Sidebar />

              {/* Main Content */}
              <div className="flex-1 flex flex-col md:ml-64">
                {/* Content */}
                <main className="flex-1 overflow-auto p-4">
                  <div className="max-w-7xl mx-auto">
                    {children}
                  </div>
                </main>
              </div>
            </div>
            <Toaster />
            <LogArchiveInitializer />
          </NuqsAdapter>
        </AuthProvider>
      </body>
    </html>
  );
}
