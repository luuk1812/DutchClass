"use client";

import { useState } from "react";

const TARGET_EMAILS = ["zxtf29@durham.ac.uk", "luukcsgo@gmail.com"];

export default function EasterEgg({ email }: { email: string }) {
  const [dismissed, setDismissed] = useState(false);

  if (!TARGET_EMAILS.includes(email.toLowerCase()) || dismissed) return null;

  return (
    <div
      className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-[260px] cursor-pointer"
      onClick={() => setDismissed(true)}
    >
      <div className="bg-dutch-blue text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 hover:opacity-95 transition-opacity animate-bounce">
        <span className="text-2xl shrink-0">👨‍💻</span>
        <div>
          <p className="font-semibold text-sm leading-snug">
            See I made this website myself!
          </p>
          <p className="text-xs opacity-60 mt-0.5">tap to close</p>
        </div>
      </div>
    </div>
  );
}
