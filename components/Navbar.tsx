"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Quota" },
  { href: "/quotes", label: "Browse" },
  { href: "/favorites", label: "Favorites" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(
    typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );

  function toggleTheme() {
    const nextIsDark = !isDark;
    const root = document.documentElement;

    root.classList.toggle("dark", nextIsDark);
    localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    document.cookie = `theme=${nextIsDark ? "dark" : "light"}; path=/; max-age=31536000`;
    setIsDark(nextIsDark);
  }

  return (
    <nav className="border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-neutral-950 dark:text-neutral-50"
        >
          Quota
        </Link>

        <div className="flex items-center gap-2">
          {links.slice(1).map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
          >
            {isDark ? "Light" : "Dark"}
          </button>
        </div>
      </div>
    </nav>
  );
}
