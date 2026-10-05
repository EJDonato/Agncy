import type { ReactNode } from "react";
import { FloatingPersonaChat } from "@/components/floating-persona-chat";

interface SeraPresenceProps {
  children: ReactNode;
  isOpen: boolean;
  isReplying: boolean;
  onToggle: () => void;
}

export function SeraPresence({ children, isOpen, isReplying, onToggle }: SeraPresenceProps) {
  return (
    <FloatingPersonaChat persona="scriptWriter" panelId="sera-chat-panel" isOpen={isOpen} isReplying={isReplying} onToggle={onToggle}>
      {children}
    </FloatingPersonaChat>
  );
}
