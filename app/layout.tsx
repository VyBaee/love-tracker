import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({ 
  subsets: ["vietnamese"],
  weight: ["400", "600", "700"],
  variable: "--font-base" 
});

export const metadata: Metadata = {
  title: "Love Tracker",
  description: "Không gian kỷ niệm của chúng mình",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${quicksand.variable} font-sans bg-theme-50 text-slate-700`}>
        {children}
      </body>
    </html>
  );
}