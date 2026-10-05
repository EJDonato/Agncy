"use client";

import { useEffect, useRef, useState } from "react";

interface TypewriterTextProps {
  animate: boolean;
  onComplete: () => void;
  text: string;
}

const CHARACTER_DELAY_MS = 22;

export function TypewriterText({ animate, onComplete, text }: TypewriterTextProps) {
  const [visibleLength, setVisibleLength] = useState(animate ? 0 : text.length);
  const completeRef = useRef(onComplete);

  useEffect(() => { completeRef.current = onComplete; }, [onComplete]);
  useEffect(() => {
    if (!animate) {
      setVisibleLength(text.length);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisibleLength(text.length);
      completeRef.current();
      return;
    }
    setVisibleLength(0);
    let nextCharacter = 0;
    const intervalId = window.setInterval(() => {
      nextCharacter += 1;
      setVisibleLength(nextCharacter);
      if (nextCharacter >= text.length) {
        window.clearInterval(intervalId);
        completeRef.current();
      }
    }, CHARACTER_DELAY_MS);
    return () => window.clearInterval(intervalId);
  }, [animate, text]);

  if (!animate) return <p>{text}</p>;
  return (
    <>
      <p className="sr-only">{text}</p>
      <p aria-hidden="true">
        {text.slice(0, visibleLength)}
        {visibleLength < text.length && <span className="ml-0.5 inline-block h-[1em] w-px translate-y-[0.15em] animate-pulse bg-[#1f54fc]" />}
      </p>
    </>
  );
}
