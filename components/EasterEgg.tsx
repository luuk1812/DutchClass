"use client";

import { useState, useEffect, useRef } from "react";

const TARGET_EMAILS = ["zxtf29@durham.ac.uk", "luukcsgo@gmail.com"];

export default function EasterEgg({ email }: { email: string }) {
  const [dismissed, setDismissed] = useState(false);
  const [pos, setPos] = useState({ x: 80, y: 80 });
  const vel = useRef({ x: 1.8, y: 1.4 });
  const boxRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!TARGET_EMAILS.includes(email.toLowerCase()) || dismissed) return;

    function animate() {
      if (!boxRef.current) { rafRef.current = requestAnimationFrame(animate); return; }

      const w = boxRef.current.offsetWidth;
      const h = boxRef.current.offsetHeight;
      const maxX = window.innerWidth  - w;
      const maxY = window.innerHeight - h;

      setPos((p) => {
        let nx = p.x + vel.current.x;
        let ny = p.y + vel.current.y;

        if (nx <= 0)    { nx = 0;    vel.current.x =  Math.abs(vel.current.x); }
        if (nx >= maxX) { nx = maxX; vel.current.x = -Math.abs(vel.current.x); }
        if (ny <= 0)    { ny = 0;    vel.current.y =  Math.abs(vel.current.y); }
        if (ny >= maxY) { ny = maxY; vel.current.y = -Math.abs(vel.current.y); }

        return { x: nx, y: ny };
      });

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [email, dismissed]);

  if (!TARGET_EMAILS.includes(email.toLowerCase()) || dismissed) return null;

  return (
    <div
      ref={boxRef}
      style={{ left: pos.x, top: pos.y }}
      className="fixed z-50 cursor-pointer select-none"
      onClick={() => setDismissed(true)}
    >
      <div className="bg-dutch-orange text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-2 hover:brightness-110 transition-[filter]">
        <span className="text-xl">💛</span>
        <div>
          <p className="font-bold text-sm whitespace-nowrap">I miss you!</p>
          <p className="text-xs opacity-60">tap to close</p>
        </div>
      </div>
    </div>
  );
}
