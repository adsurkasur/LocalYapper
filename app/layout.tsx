import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navigation } from "@/components/navigation";
import MainContainer from "@/components/ui/main-container";
import RouteTransition from "@/components/ui/route-transition";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LocalYapper",
  description: "Privacy-first locally hosted roleplay chatbot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <Navigation />
            <MainContainer>
              <RouteTransition>
                {children}
              </RouteTransition>
            </MainContainer>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
