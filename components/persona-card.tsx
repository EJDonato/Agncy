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
      <div className="absolute bottom-0 left-1/2 h-72 w-full -translate-x-1/2 overflow-hidden" aria-hidden="true">
        <Image
          src={profile.image}
          alt={`${profile.role} persona`}
          width={1159}
          height={1500}
          sizes="465px"
          className="absolute left-1/2 top-0 h-[600px] w-auto max-w-none -translate-x-1/2"
          priority
        />
      </div>
      {bubbleVisible && (
        <div className="pointer-events-auto absolute bottom-16 left-[calc(100%-0.5rem)] w-64 rounded-xl border border-border-strong bg-surface-raised/95 p-3 pr-9 shadow-2xl backdrop-blur sm:w-72">
          <button
            type="button"
            onClick={() => setBubbleVisible(false)}
            aria-label={`Dismiss ${profile.role} message`}
            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-surface-subtle hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-brand-amber">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{profile.role}</span>
          </div>
          <p className={`${compact ? "text-[10px]" : "text-[11px]"} leading-relaxed text-slate-200`}>
            “{message ?? profile.greeting}”
          </p>
        </div>
      )}
    </aside>,
    dock,
  );
}
