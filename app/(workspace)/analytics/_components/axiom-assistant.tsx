"use client";

import Image from "next/image";
import { BarChart3, Loader2, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FloatingPersonaChat } from "@/components/floating-persona-chat";
import { TypewriterText } from "@/components/typewriter-text";
import type { AxiomChatTurn, SendAxiomMessage } from "@/lib/analytics/axiom-chat-contract";
import { PERSONAS } from "@/lib/personas";

const ENDPOINT = "/api/analytics/axiom-chat";
const STARTERS = [
  "What pattern is strongest in my posts?",
  "Which post should I learn from next?",
  "What should I test in my next Reel?",
] as const;

async function loadTurns(): Promise<AxiomChatTurn[]> {
  const response = await fetch(ENDPOINT, { cache: "no-store" });
  const payload: unknown = await response.json().catch(() => null);
  const { AxiomHistoryResponseSchema } = await import("@/lib/analytics/axiom-chat-contract");
  const parsed = AxiomHistoryResponseSchema.safeParse(payload);
  if (!parsed.success) throw new Error("Axiom returned an unreadable response.");
  if (!parsed.data.success) throw new Error(parsed.data.error.message);
  return parsed.data.turns;
}

async function sendQuestion(input: SendAxiomMessage): Promise<AxiomChatTurn> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload: unknown = await response.json().catch(() => null);
  const { AxiomMessageResponseSchema } = await import("@/lib/analytics/axiom-chat-contract");
  const parsed = AxiomMessageResponseSchema.safeParse(payload);
  if (!parsed.success) throw new Error("Axiom returned an unreadable response.");
  if (!parsed.data.success) throw new Error(parsed.data.error.message);
  return parsed.data.turn;
}

export function AxiomAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [turns, setTurns] = useState<AxiomChatTurn[]>([]);
  const [message, setMessage] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [typingTurnId, setTypingTurnId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const profile = PERSONAS.performanceAnalyst;

  useEffect(() => {
    let cancelled = false;
    void loadTurns().then((saved) => { if (!cancelled) setTurns(saved); })
      .catch((loadError) => { if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Could not load Axiom's conversation."); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [pendingMessage, turns, typingTurnId]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextMessage = message.trim();
    if (!nextMessage || pendingMessage || typingTurnId) return;
    setMessage("");
    setPendingMessage(nextMessage);
    setError(null);
    try {
      const turn = await sendQuestion({ requestId: crypto.randomUUID(), message: nextMessage });
      setTurns((current) => [...current, turn]);
      setTypingTurnId(turn.id);
    } catch (sendError) {
      setMessage(nextMessage);
      setError(sendError instanceof Error ? sendError.message : "Axiom could not respond right now.");
    } finally {
      setPendingMessage(null);
    }
  }

  const isReplying = Boolean(pendingMessage || typingTurnId);
  return (
    <FloatingPersonaChat persona="performanceAnalyst" panelId="axiom-chat-panel" isOpen={isOpen} isReplying={isReplying} onToggle={() => setIsOpen((open) => !open)}>
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-[0_24px_60px_-16px_rgba(15,23,42,0.28)] backdrop-blur-2xl" aria-label="Conversation with Axiom">
        <header className="border-b border-slate-200 bg-gradient-to-br from-blue-50 to-violet-50 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white bg-white shadow-sm"><Image src={profile.image} alt="" fill sizes="48px" className="object-cover object-top" /></div>
            <div className="min-w-0">
              <div className="flex items-center gap-2"><h2 className="text-sm font-semibold text-slate-900">Axiom</h2><span className="rounded-full border border-blue-200 bg-white/80 px-2 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider text-[#1f54fc]">Performance Analyst</span></div>
              <p className="mt-0.5 text-[11px] text-slate-600">Answers from your imported performance data</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat with Axiom" className="apple-press ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-white/80 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f54fc]"><X className="h-4 w-4" /></button>
          </div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite" aria-busy={Boolean(pendingMessage)}>
          {turns.length === 0 && !pendingMessage && (
            <div className="space-y-3">
              <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-blue-100 bg-blue-50 px-3.5 py-3 text-xs leading-relaxed text-slate-700">Ask me what is working, what the evidence supports, or what experiment to run next.</div>
              <div className="flex flex-wrap gap-2">{STARTERS.map((starter) => <button key={starter} type="button" onClick={() => setMessage(starter)} className="apple-press rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-[10px] text-slate-600 hover:border-[#1f54fc]/30 hover:text-[#1f54fc]">{starter}</button>)}</div>
            </div>
          )}
          {turns.map((turn) => (
            <div key={turn.id} className="space-y-2 apple-item-enter">
              <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-slate-900 px-3.5 py-2.5 text-xs leading-relaxed text-white">{turn.userMessage}</div>
              <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs leading-relaxed text-slate-700"><TypewriterText animate={turn.id === typingTurnId} onComplete={() => setTypingTurnId((current) => current === turn.id ? null : current)} text={turn.assistantMessage} /></div>
            </div>
          ))}
          {pendingMessage && <div className="space-y-2"><div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-slate-900 px-3.5 py-2.5 text-xs text-white">{pendingMessage}</div><div className="flex w-fit items-center gap-2 rounded-2xl rounded-tl-md border border-blue-100 bg-blue-50 px-3.5 py-2.5 text-[11px] text-slate-600"><Loader2 className="h-3.5 w-3.5 animate-spin text-[#1f54fc]" />Axiom is checking the data…</div></div>}
          <div ref={endRef} />
        </div>

        <form onSubmit={submit} className="border-t border-slate-200 bg-slate-50/80 p-3">
          {error && <p role="alert" className="mb-2 rounded-lg border border-brand-rose/20 bg-brand-rose/5 px-3 py-2 text-[10px] text-brand-rose">{error}</p>}
          <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-[#1f54fc] focus-within:ring-2 focus-within:ring-[#1f54fc]/15">
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} disabled={isReplying} maxLength={1_500} rows={3} aria-label="Message Axiom" placeholder="Ask Axiom about your performance data…" className="w-full resize-none bg-transparent px-1 py-1 text-xs leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-60" />
            <div className="flex items-center justify-between gap-2 px-1"><span className="flex items-center gap-1 text-[9px] text-slate-400"><BarChart3 className="h-3 w-3" /> Uses imported metrics</span><button type="submit" disabled={!message.trim() || isReplying} aria-label="Send message to Axiom" className="apple-btn-primary flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-40">{isReplying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}</button></div>
          </div>
        </form>
      </section>
    </FloatingPersonaChat>
  );
}
