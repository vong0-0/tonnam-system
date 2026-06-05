import type { Metadata } from "next";
import { Playfair_Display, Noto_Sans_Lao, JetBrains_Mono } from "next/font/google";
import SiteNavbar from "@/components/common/site-navbar";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const notoSansLao = Noto_Sans_Lao({
  variable: "--font-body",
  subsets: ["lao"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tonnam",
  description: "TonNam Restaurant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="lo"
      className={`${playfairDisplay.variable} ${notoSansLao.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <SiteNavbar />
          {children}
        </body>
    </html>
  );
}
