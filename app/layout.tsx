import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Providers } from "./providers";
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
  title: "PharmaLink",
  description: "Medicine availability & pharmacy companion for Ethiopia",
};

// Runs before hydration so the correct theme applies on first paint — avoids
// a light-mode flash for users whose stored/system preference is dark.
const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('pharmalink_theme');var t=s==='light'||s==='dark'?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // The theme-init script below sets data-theme on this element before
      // React hydrates, so its attributes will legitimately differ from what
      // was server-rendered — this is the standard, safe way to tell React
      // that specific, expected mismatch is intentional.
      suppressHydrationWarning
    >
      {/*
        suppressHydrationWarning here too: browser extensions like Grammarly
        inject attributes (data-new-gr-c-s-check-loaded, data-gr-ext-installed)
        onto <body> before React hydrates. That's an external, harmless
        mismatch outside our control — not a bug in this app's code.
      */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script
          id="pharmalink-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
