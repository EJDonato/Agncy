"use client";

import Image from "next/image";
import { MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PERSONAS, type PersonaKey } from "@/lib/personas";

interface PersonaCardProps {
  persona: PersonaKey;
  message?: string;
  compact?: boolean;
}

export function PersonaCard({ persona, message, compact = false }: PersonaCardProps) {
  const [mounted, setMounted] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const profile = PERSONAS[persona];

  useEffect(() => setMounted(true), []);

  const dock = mounted ? document.getElementById("persona-dock") : null;
  if (!dock) return null;

  return createPortal(
    <aside
      className={`pointer-events-none absolute inset-0 ${compact ? "z-20" : "z-10"}`}
      aria-label={`${profile.role} says`}
    >
      <div className="absolute bottom-0 left-1/2 h-64 w-full -translate-x-1/2 overflow-hidden flex items-end justify-center" aria-hidden="true">
        <Image
          src={profile.image}
          alt={`${profile.role} persona`}
          width={1159}
          height={1500}
          sizes="256px"
          className="h-56 w-auto max-w-none object-contain drop-shadow-md select-none pointer-events-none"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </div>
      {bubbleVisible && (
        <div className="pointer-events-auto absolute top-3 left-3 right-3 rounded-2xl border border-slate-200/90 bg-white/95 p-3 pr-8 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,1)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200 z-20">
          <button
            type="button"
            onClick={() => setBubbleVisible(false)}
            aria-label={`Dismiss ${profile.role} message`}
            className="apple-press absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
          >
            <X className="h-3 w-3" />
          </button>
          <div className="mb-1 flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-amber-800 font-semibold">
            <MessageCircle className="h-3 w-3" />
            <span>{profile.role}</span>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-800 font-medium line-clamp-3">
            “{message ?? profile.greeting}”
          </p>
        </div>
      )}
    </aside>,
    dock,
  );
}
