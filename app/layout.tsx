import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";

import Navbar from "@/components/Navbar";

import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quota",
  description: "A curated quotes app with browsing, tags, and favorites.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>❝</text></svg>",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value === "dark" ? "dark" : "";

  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable} ${theme} h-full antialiased`}>
      <body className="min-h-full bg-neutral-50 font-sans text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
        <div className="flex min-h-full flex-col">
          <Navbar />
          <main className="mx-auto flex w-full max-w-6xl flex-1 px-6 py-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
