"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3 px-4 md:relative md:border-t-0 md:border-b md:py-4 z-50">
      <div className="max-w-2xl mx-auto flex justify-center gap-8">
        <NavLink href="/" active={pathname === "/"}>
          Status
        </NavLink>
        <NavLink href="/history" active={pathname === "/history"}>
          History
        </NavLink>
        <NavLink href="/leaderboard" active={pathname === "/leaderboard"}>
          Leaderboard
        </NavLink>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
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
