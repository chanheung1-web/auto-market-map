import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "自動車マーケットマップ",
  description:
    "自動車バリューチェーン（完成車・部品・電池・半導体・ソフトウェア・素材）の株価と業界ニュースを1画面で見る個人用ダッシュボード",
  // stock-trading-app と同じくホーム画面から起動して使う。
  appleWebApp: {
    capable: true,
    title: "自動車マップ",
    statusBarStyle: "black",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
