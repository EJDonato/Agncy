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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <aside
      className={`fixed bottom-0 left-0 ${
        compact ? "z-[60]" : "z-50"
      } pointer-events-none select-none flex items-end`}
      aria-label={`${profile.role} companion`}
    >
      <div className="relative flex items-end pointer-events-none">
        {/* 1. Text Bubble on the RIGHT: Sits underneath at z-10 so it never cuts the persona */}
        {bubbleVisible && (
          <div className="pointer-events-auto absolute bottom-14 sm:bottom-20 left-[240px] sm:left-[300px] z-10 w-[280px] sm:w-[340px] max-w-[calc(100vw-320px)] rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.04)] backdrop-blur-2xl animate-in fade-in slide-in-from-left-4 duration-200">
            {/* Triangular speech bubble tail pointing toward the persona on the left */}
            <div
              aria-hidden="true"
              className="absolute -left-2 bottom-6 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-white border-b-[6px] border-b-transparent drop-shadow-[-1px_0_0_rgb(226,232,240)]"
            />

            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50/90 border border-blue-200 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#1f54fc]">
                <MessageCircle className="h-3 w-3 text-[#1f54fc]" />
                <span>{profile.role}</span>
              </div>
              <button
                type="button"
                onClick={() => setBubbleVisible(false)}
                aria-label={`Dismiss ${profile.role} message`}
                className="apple-press flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f54fc]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="text-xs leading-relaxed text-slate-800 font-medium">
              “{message ?? profile.greeting}”
            </p>
          </div>
        )}

        {/* 2. Persona Image: Anchored to the LEFTMOST edge, on the VERY TOP (z-30), strictly upper 50% cropped */}
        <div 
          className="relative z-30 h-[300px] w-[260px] sm:h-[380px] sm:w-[320px] overflow-visible shrink-0 pointer-events-none"
          aria-hidden="true"
        >
          <Image
            src={profile.image}
            alt={`${profile.role} persona`}
            width={1159}
            height={1500}
            unoptimized
            className="absolute top-0 left-0 -translate-x-[24%] h-[200%] w-auto max-w-none pointer-events-none drop-shadow-2xl select-none [clip-path:inset(0_0_50%_0)]"
            priority
          />
        </div>
      </div>
    </aside>,
    document.body
  );
}
