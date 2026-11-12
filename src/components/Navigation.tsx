"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { prefetchQuakesForRoute, usePrefetchAllQuakesWhenIdle } from "@/lib/quakeCache";

export default function Navigation() {
  const pathname = usePathname();
  const [pending, setPending] = useState<{ href: string; from: string } | null>(null);
  // Any route change (including browser Back/Forward) settles the pending tab.
  if (pending && pending.from !== pathname) setPending(null);
  // Highlight the tapped tab immediately, before the route commits.
  const current = pending && pending.from === pathname ? pending.href : pathname;
  const select = (href: string) => setPending({ href, from: pathname });

  usePrefetchAllQuakesWhenIdle();

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
  const warm = () => prefetchQuakesForRoute(href);
  return (
    <Link
      href={href}
      onPointerEnter={warm}
      onTouchStart={warm}
      onFocus={warm}
      onClick={() => onSelect(href)}
      aria-current={active ? "page" : undefined}
      className={`text-sm font-medium transition-colors ${
        active
          ? "text-gray-900"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      {children}
    </Link>
  );
}
