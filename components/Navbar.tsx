"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/quotes", label: "Browse" },
  { href: "/favorites", label: "Favorites" },
] as const;

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="vn-quickmenu border-b border-[#c9a84c]/20">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="font-serif text-xl font-semibold italic tracking-wide text-[#c9a84c] transition-opacity hover:opacity-80"
        >
          Quota
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`vn-btn-choice px-5 py-2 text-sm font-medium ${
                  active ? "text-[#F16423]" : "text-[#f5ead8]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
