import type { Metadata } from "next";
import { Toaster } from "sonner";
import GlobalEffects from "@/components/global-effects";
import ClientLayout from "@/components/client-layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "VisionLoop",
  description: "AI 视觉导演助手 — 将文字主题转化为专业分镜和故事板",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@400;600;700;900&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen font-sans antialiased"
        style={{
          backgroundColor: "#ffffff",
          color: "#0D1B2A",
          backgroundImage: "none",
        }}
      >
        <ClientLayout>
          <GlobalEffects>
            {children}
          </GlobalEffects>
        </ClientLayout>
        <Toaster
          position="top-center"
          theme="light"
          expand={false}
          visibleToasts={5}
          duration={4000}
          closeButton={true}
          richColors={false}
          toastOptions={{
            style: {
              borderRadius: "12px",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
              background: "rgba(255,255,255,0.98)",
              backdropFilter: "blur(16px)",
              color: "#0D1B2A",
              fontSize: "13px",
              fontWeight: 500,
            },
          }}
        />
      </body>
    </html>
  );
}
