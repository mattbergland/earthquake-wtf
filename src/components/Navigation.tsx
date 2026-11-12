"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  const [pending, setPending] = useState<{ href: string; from: string } | null>(null);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setPending(null);
  }
  // Highlight the tapped tab immediately, before the route commits.
  const current = pending && pending.from === pathname ? pending.href : pathname;
  const select = (href: string) => setPending({ href, from: pathname });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3 px-4 md:relative md:border-t-0 md:border-b md:py-4 z-50">
      <div className="max-w-2xl mx-auto flex justify-center gap-8">
        <NavLink href="/" active={current === "/"} onSelect={select}>
          Status
        </NavLink>
        <NavLink href="/history" active={current === "/history"} onSelect={select}>
          History
        </NavLink>
        <NavLink href="/leaderboard" active={current === "/leaderboard"} onSelect={select}>
          Leaderboard
        </NavLink>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  active,
  onSelect,
  children,
}: {
  href: string;
  active: boolean;
  onSelect: (href: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={() => onSelect(href)}
      aria-current={active ? "page" : undefined}
      className={`inline-block text-sm font-medium transition-transform duration-150 motion-safe:active:scale-[0.98] ${
        active
          ? "text-gray-900"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      {children}
    </Link>
  );
}
