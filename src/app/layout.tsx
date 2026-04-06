import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "팜에듀 — PharmaEdu",
  description: "약국 조제료 계산 시뮬레이터 + 퀴즈 학습 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
