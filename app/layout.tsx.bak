import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Noto_Sans_Ethiopic } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/i18n";
import { Backdrop } from "@/components/layout/backdrop";
import { getLocaleFromRequest } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Ethiopic glyphs (Geist has none). Latin text still renders in Geist - this
// font sits after it in the stack and only supplies Amharic coverage.
const notoEthiopic = Noto_Sans_Ethiopic({
  variable: "--font-ethiopic",
  subsets: ["ethiopic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromRequest();
  const t = dictionaries[locale];
  return {
    title: t.meta.homeTitle,
    description: t.meta.homeDescription,
  };
}

// Applied before first paint so an Amharic visitor never sees English <html lang>.
const themeInitScript = `(function(){try{var t=localStorage.getItem("pharmalink-theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})();`;

// Injects the server-rendered locale (request cookie) so the first client
// render matches SSR and the <html lang> attribute is correct before paint.
function localeInitScript(locale: Locale): string {
  return `(function(){try{var l=${JSON.stringify(locale)};if(l==="am"||l==="en"){window.__PHARMALINK_LOCALE__=l;document.documentElement.lang=l}}catch(e){}})();`;
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocaleFromRequest();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoEthiopic.variable} h-full antialiased`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <Script id="locale-init" strategy="beforeInteractive">
          {localeInitScript(locale)}
        </Script>
      </head>
      <body className="min-h-full">
        <Backdrop />
        <ThemeProvider>
          <LanguageProvider initialLocale={locale}>
            <AuthProvider>{children}</AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}