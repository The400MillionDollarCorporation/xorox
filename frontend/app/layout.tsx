import type { Metadata } from "next";
import localFont from "next/font/local";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import Layout from "@/components/sections/layout";
import { EnvironmentStoreProvider } from "@/components/context";
import { Toaster } from "@/components/ui/toaster";
import SolanaWalletProvider from "@/components/providers/wallet-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Iris | World's Best Memecoin Hunter",
  description: "An autonomous AI agent that hunts for new memecoins in Tiktok.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Iris | World's Best Memecoin Hunter",
    description:
      "An autonomous AI agent that hunts for new memecoins in Tiktok.",
    images: ["/iris.jpg"],
  },
  other: {
    "twitter:player": "https://zorox-ai.vercel.app/embed",
    "x-frame-options": "ALLOWALL",
    "content-security-policy":
      "frame-ancestors 'self' https://twitter.com https://x.com;",
  },
  twitter: {
    card: "player",
    site: "https://x.com/iris_internet",
    title: "Iris | World's Best Memecoin Hunter",
    images: ["https://zorox-ai.vercel.app/iris.jpg"],
    description:
      "An autonomous AI agent that hunts for new memecoins in Tiktok.",
    players: [
      {
        playerUrl: "https://zorox-ai.vercel.app/embed",
        streamUrl: "https://zorox-ai.vercel.app/embed",
        width: 360,
        height: 560,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <EnvironmentStoreProvider>
      <html lang="en">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <SolanaWalletProvider>
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased select-none`}
            >
              <Layout>{children}</Layout>
              <Toaster />
            </body>
          </SolanaWalletProvider>
        </ThemeProvider>
      </html>
    </EnvironmentStoreProvider>
  );
}
