"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PERSONAS, type PersonaKey } from "@/lib/personas";
import styles from "./floating-persona-chat.module.css";

interface FloatingPersonaChatProps {
  children: ReactNode;
  isOpen: boolean;
  isReplying: boolean;
  onToggle: () => void;
  panelId: string;
  persona: PersonaKey;
}

export function FloatingPersonaChat({ children, isOpen, isReplying, onToggle, panelId, persona }: FloatingPersonaChatProps) {
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const profile = PERSONAS[persona];

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) triggerRef.current?.focus();
    wasOpenRef.current = isOpen;
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onToggle();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onToggle]);

  if (!mounted) return null;
  return createPortal(
    <aside className="pointer-events-none fixed inset-0 z-[60] select-none" aria-label={`${profile.name}, ${profile.role}`}>
      <div id={panelId} aria-hidden={!isOpen} className={`fixed bottom-24 left-4 right-4 h-[min(520px,calc(100dvh-8rem))] origin-bottom-left transition-[opacity,transform,visibility] duration-200 ease-out sm:bottom-20 sm:left-[280px] sm:right-auto sm:h-[min(560px,calc(100dvh-6rem))] sm:w-[min(380px,calc(100vw-296px))] ${isOpen ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100" : "pointer-events-none invisible translate-y-2 scale-[0.98] opacity-0"}`}>
        {children}
      </div>
      <button ref={triggerRef} type="button" onClick={onToggle} aria-controls={panelId} aria-expanded={isOpen} aria-label={`${isOpen ? "Close" : "Open"} chat with ${profile.name}`} className={`${styles.presence} pointer-events-auto fixed bottom-0 left-0 h-[300px] w-[260px] cursor-pointer overflow-visible focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1f54fc] sm:h-[380px] sm:w-[320px]`}>
        <div className={`${isReplying ? styles.talking : styles.idle} relative h-full w-full`}>
          <Image src={profile.image} alt="" width={1159} height={1500} unoptimized priority className="pointer-events-none absolute left-0 top-0 h-[200%] w-auto max-w-none -translate-x-[24%] select-none drop-shadow-2xl [clip-path:inset(0_0_50%_0)]" />
        </div>
      </button>
      <span className="sr-only" aria-live="polite">{isReplying ? `${profile.name} is replying.` : ""}</span>
    </aside>,
    document.body,
  );
}
