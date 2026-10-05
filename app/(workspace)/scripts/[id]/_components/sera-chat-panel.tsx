"use client";

import Image from "next/image";
import { Check, Loader2, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SendSeraMessage, SeraChatResult, SeraChatTurn } from "@/lib/scripts/sera-chat-contract";
import { PERSONAS } from "@/lib/personas";
import { TypewriterText } from "@/components/typewriter-text";

interface SeraChatPanelProps {
  scriptId: string;
  scriptTitle: string;
  currentContent: string;
  initialTurns: SeraChatTurn[];
  onRevision: (content: string) => void;
  onBusyChange: (isBusy: boolean) => void;
  onClose: () => void;
  onReplyingChange: (isReplying: boolean) => void;
}

const STARTERS = [
  "Review the hook without changing it",
  "Where does the pacing drag?",
  "Make the spoken lines more conversational",
] as const;

async function sendSeraMessage(input: SendSeraMessage): Promise<SeraChatResult> {
  const response = await fetch("/api/scripts/sera-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload: unknown = await response.json().catch(() => null);
  const { SeraChatApiResponseSchema } = await import("@/lib/scripts/sera-chat-contract");
  const parsed = SeraChatApiResponseSchema.safeParse(payload);
  if (!parsed.success) throw new Error("Sera returned an unreadable response. Your script was not changed.");
  if (!parsed.data.success) throw new Error(parsed.data.error.message);
  return parsed.data.result;
}

export function SeraChatPanel({ scriptId, scriptTitle, currentContent, initialTurns, onRevision, onBusyChange, onClose, onReplyingChange }: SeraChatPanelProps) {
  const [turns, setTurns] = useState(initialTurns);
  const [message, setMessage] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [typingTurnId, setTypingTurnId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const profile = PERSONAS.scriptWriter;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [turns, pendingMessage, typingTurnId]);

  useEffect(() => {
    onReplyingChange(typingTurnId !== null);
    return () => onReplyingChange(false);
  }, [onReplyingChange, typingTurnId]);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextMessage = message.trim();
    if (!nextMessage || pendingMessage || typingTurnId) return;
    setMessage("");
    setPendingMessage(nextMessage);
    onBusyChange(true);
    setError(null);
    try {
      const result = await sendSeraMessage({
        requestId: crypto.randomUUID(),
        scriptId,
        currentContent,
        message: nextMessage,
      });
      setTurns((current) => [...current, result.turn]);
      setTypingTurnId(result.turn.id);
      if (result.revisedContent) onRevision(result.revisedContent);
    } catch (sendError) {
      setMessage(nextMessage);
      setError(sendError instanceof Error ? sendError.message : "Sera could not respond right now.");
    } finally {
      setPendingMessage(null);
      onBusyChange(false);
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-[0_24px_60px_-16px_rgba(15,23,42,0.28)] backdrop-blur-2xl" aria-label="Conversation with Sera">
      <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-blue-50 to-violet-50 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
            <Image src={profile.image} alt="" fill sizes="48px" className="object-cover object-top" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">{profile.name}</h2>
              <span className="rounded-full border border-blue-200 bg-white/80 px-2 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider text-[#1f54fc]">Script Writer</span>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-slate-600">Working with you on {scriptTitle}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close chat with Sera" className="apple-press ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-white/80 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f54fc]">
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite" aria-busy={Boolean(pendingMessage)}>
        {turns.length === 0 && (
          <div className="space-y-3">
            <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-blue-100 bg-blue-50 px-3.5 py-3 text-xs leading-relaxed text-slate-700">
              I’ve read the current draft. Ask me why something works, explore alternatives with me, or tell me exactly what you want changed.
            </div>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((starter) => (
                <button key={starter} type="button" onClick={() => setMessage(starter)} className="apple-press rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-[10px] text-slate-600 hover:border-[#1f54fc]/30 hover:text-[#1f54fc]">
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((turn) => (
          <div key={turn.id} className="space-y-2 apple-item-enter">
            <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-slate-900 px-3.5 py-2.5 text-xs leading-relaxed text-white">
              {turn.userMessage}
            </div>
            <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs leading-relaxed text-slate-700">
              <TypewriterText
                animate={turn.id === typingTurnId}
                onComplete={() => setTypingTurnId((current) => current === turn.id ? null : current)}
                text={turn.assistantMessage}
              />
              {turn.action === "revise" && turn.id !== typingTurnId && (
                <div className="mt-2 flex items-center gap-1.5 border-t border-slate-200 pt-2 text-[10px] font-mono font-medium text-brand-emerald">
                  <Check className="h-3 w-3" />
                  <span>Applied to script · version saved</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {pendingMessage && (
          <div className="space-y-2">
            <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-slate-900 px-3.5 py-2.5 text-xs leading-relaxed text-white">{pendingMessage}</div>
            <div className="flex w-fit items-center gap-2 rounded-2xl rounded-tl-md border border-blue-100 bg-blue-50 px-3.5 py-2.5 text-[11px] text-slate-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1f54fc]" />
              <span>Sera is thinking through the draft…</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t border-slate-200 bg-slate-50/80 p-3">
        {error && <p role="alert" className="mb-2 rounded-lg border border-brand-rose/20 bg-brand-rose/5 px-3 py-2 text-[10px] text-brand-rose">{error}</p>}
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-[#1f54fc] focus-within:ring-2 focus-within:ring-[#1f54fc]/15">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            disabled={Boolean(pendingMessage || typingTurnId)}
            maxLength={1_500}
            rows={3}
            aria-label="Message Sera"
            placeholder="Ask Sera about the draft or tell her what to change…"
            className="w-full resize-none bg-transparent px-1 py-1 text-xs leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-60"
          />
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="flex items-center gap-1 text-[9px] text-slate-400"><Sparkles className="h-3 w-3" /> Shift + Enter for a new line</span>
            <button type="submit" disabled={!message.trim() || Boolean(pendingMessage || typingTurnId)} aria-label="Send message to Sera" className="apple-btn-primary flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-40">
              {pendingMessage || typingTurnId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
