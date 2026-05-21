"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

interface Props {
  isAdmin: boolean;
  email: string | undefined;
}

export default function MobileMenu({ isAdmin, email }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="sm:hidden relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-lg hover:bg-gray-100 transition"
        aria-label="Toggle menu"
      >
        {open ? (
          <span className="text-lg font-medium text-gray-600">✕</span>
        ) : (
          <div className="flex flex-col gap-1.5 w-5">
            <span className="block h-0.5 bg-gray-600 rounded" />
            <span className="block h-0.5 bg-gray-600 rounded" />
            <span className="block h-0.5 bg-gray-600 rounded" />
          </div>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={close} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border shadow-xl py-2 z-50">
            <NavItem href="/flashcards" onClick={close}>🃏 Flashcards</NavItem>
            <NavItem href="/theory"     onClick={close}>📖 Theory</NavItem>
            <NavItem href="/stats"      onClick={close}>📊 Stats</NavItem>
            <NavItem href="/settings"   onClick={close}>⚙️ Settings</NavItem>
            {isAdmin && (
              <NavItem href="/admin" onClick={close}>🛠 Admin</NavItem>
            )}
            <div className="my-2 border-t" />
            <p className="px-4 py-1 text-xs text-gray-400 truncate">{email}</p>
            <div className="px-4 py-2">
              <LogoutButton />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NavItem({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-dutch-orange transition"
    >
      {children}
    </Link>
  );
}
