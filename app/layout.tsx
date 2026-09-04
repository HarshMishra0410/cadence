import type { Metadata } from "next";
import { Quicksand, Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jbmono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Cadence",
  description: "Facets' LinkedIn content-ops platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${quicksand.variable} ${inter.variable} ${jbmono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <header className="px-6 py-6 flex items-center justify-between max-w-5xl w-full mx-auto">
          <Link href="/" className="inline-flex items-baseline gap-1">
            <span className="font-display font-bold text-2xl tracking-tight" style={{ color: "#0a0a0a" }}>
              Cadence
            </span>
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: "0.5rem",
                height: "0.5rem",
                borderRadius: "50%",
                background: "var(--pop-blue)",
                marginBottom: "0.05rem",
              }}
            />
          </Link>
          <nav className="flex items-center gap-4 text-sm mono">
            <Link href="/" style={{ color: "var(--clay-ink-soft)" }}>
              LinkedIn
            </Link>
            <Link href="/website" style={{ color: "var(--clay-ink-soft)" }}>
              Website Content
            </Link>
          </nav>
        </header>
        <main className="flex-1 px-6 pb-16 max-w-5xl w-full mx-auto">{children}</main>
      </body>
    </html>
  );
}
