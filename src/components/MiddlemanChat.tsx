/**
 * MiddlemanChat.tsx
 * ------------------------------------------------------------------
 * Floating AI chat widget for Middleman Motors.
 *  - Threaded conversations, persisted to localStorage (this browser only)
 *  - Streams from a Supabase Edge Function at /functions/v1/ai-chat
 *    (OpenAI-compatible SSE: `data: { choices:[{delta:{content}}] }`)
 *
 * Requirements:
 *  - React 18 + TypeScript + Tailwind
 *  - shadcn/ui <Button> at "@/components/ui/button"
 *  - `cn` helper at "@/lib/utils"
 *  - lucide-react
 *  - Env vars:
 *      VITE_SUPABASE_URL
 *      VITE_SUPABASE_PUBLISHABLE_KEY
 *
 * Mount once at the app root:
 *   import { MiddlemanChat } from "@/components/MiddlemanChat";
 *   <MiddlemanChat />
 * ------------------------------------------------------------------
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2, Plus, Trash2, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Role = "user" | "assistant";
interface Message {
  role: Role;
  content: string;
}
interface Thread {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
}

const STORAGE_KEY = "middleman.chat.threads.v1";
const ACTIVE_KEY = "middleman.chat.activeThread.v1";
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const WELCOME: Message = {
  role: "assistant",
  content:
    "Welcome to Middleman Motors. I can help with inventory, financing, credit applications, hours, and directions to our Snellville, GA location. What can I do for you?",
};

const SUGGESTED_PROMPTS: string[] = [
  "What's your current inventory?",
  "What financing options do you offer?",
  "How does a trade-in work?",
  "Can I schedule a test drive?",
];

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const makeThread = (): Thread => ({
  id: uid(),
  title: "New conversation",
  updatedAt: Date.now(),
  messages: [WELCOME],
});

const loadInitial = (): { threads: Thread[]; activeId: string } => {
  if (typeof window === "undefined") {
    const t = makeThread();
    return { threads: [t], activeId: t.id };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: Thread[] = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed) && parsed.length > 0) {
      const active = window.localStorage.getItem(ACTIVE_KEY) || parsed[0].id;
      const activeId = parsed.find((t) => t.id === active)?.id ?? parsed[0].id;
      return { threads: parsed, activeId };
    }
  } catch {
    // fall through
  }
  const t = makeThread();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([t]));
  window.localStorage.setItem(ACTIVE_KEY, t.id);
  return { threads: [t], activeId: t.id };
};

export const MiddlemanChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showThreadList, setShowThreadList] = useState(false);
  const [{ threads, activeId }, setState] = useState<{ threads: Thread[]; activeId: string }>(
    () => loadInitial(),
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeId) ?? threads[0],
    [threads, activeId],
  );

  // Persist to localStorage whenever threads/activeId change.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
      window.localStorage.setItem(ACTIVE_KEY, activeId);
    } catch {
      // ignore quota errors
    }
  }, [threads, activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages.length, isLoading]);

  useEffect(() => {
    if (isOpen && !showThreadList) inputRef.current?.focus();
  }, [isOpen, activeId, showThreadList]);

  const updateThread = (id: string, updater: (t: Thread) => Thread) => {
    setState((prev) => ({
      ...prev,
      threads: prev.threads.map((t) => (t.id === id ? updater(t) : t)),
    }));
  };

  const newThread = () => {
    const t = makeThread();
    setState((prev) => ({ threads: [t, ...prev.threads], activeId: t.id }));
    setShowThreadList(false);
    setInput("");
  };

  const selectThread = (id: string) => {
    setState((prev) => ({ ...prev, activeId: id }));
    setShowThreadList(false);
  };

  const deleteThread = (id: string) => {
    setState((prev) => {
      const remaining = prev.threads.filter((t) => t.id !== id);
      if (remaining.length === 0) {
        const t = makeThread();
        return { threads: [t], activeId: t.id };
      }
      const nextActive = prev.activeId === id ? remaining[0].id : prev.activeId;
      return { threads: remaining, activeId: nextActive };
    });
  };

  const sendMessage = async (overrideText?: string) => {
    const trimmed = (overrideText ?? input).trim();
    if (!trimmed || isLoading || !activeThread) return;

    const threadId = activeThread.id;
    const userMessage: Message = { role: "user", content: trimmed };
    const nextMessages = [...activeThread.messages, userMessage];

    updateThread(threadId, (t) => ({
      ...t,
      messages: nextMessages,
      updatedAt: Date.now(),
      title:
        t.title === "New conversation"
          ? trimmed.slice(0, 40) + (trimmed.length > 40 ? "…" : "")
          : t.title,
    }));
    setInput("");
    setIsLoading(true);

    let assistantContent = "";
    let assistantAppended = false;

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok || !response.body) throw new Error("Failed to get response");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              if (!assistantAppended) {
                assistantAppended = true;
                updateThread(threadId, (t) => ({
                  ...t,
                  messages: [...t.messages, { role: "assistant", content: assistantContent }],
                  updatedAt: Date.now(),
                }));
              } else {
                updateThread(threadId, (t) => {
                  const msgs = [...t.messages];
                  msgs[msgs.length - 1] = { role: "assistant", content: assistantContent };
                  return { ...t, messages: msgs, updatedAt: Date.now() };
                });
              }
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (!assistantAppended) {
        updateThread(threadId, (t) => ({
          ...t,
          messages: [
            ...t.messages,
            { role: "assistant", content: "Sorry, I didn't catch that. Please try again." },
          ],
          updatedAt: Date.now(),
        }));
      }
    } catch (error) {
      console.error("Chat error:", error);
      updateThread(threadId, (t) => ({
        ...t,
        messages: [
          ...t.messages,
          { role: "assistant", content: "Sorry, I encountered an issue. Please try again." },
        ],
        updatedAt: Date.now(),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sortedThreads = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);
  const messages = activeThread?.messages ?? [];
  const lastRole = messages[messages.length - 1]?.role;

  return (
    <>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl",
          isOpen && "rotate-90",
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 flex h-[560px] w-[400px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl transition-all duration-300",
          isOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-primary/5 px-4 py-3">
          <button
            onClick={() => setShowThreadList((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Toggle conversations"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-foreground">
              {showThreadList ? "Conversations" : activeThread?.title || "The Middleman"}
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              {showThreadList
                ? `${threads.length} saved on this device`
                : "Middleman Motors concierge"}
            </p>
          </div>
          <button
            onClick={newThread}
            className="flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium text-primary hover:bg-primary/10"
            aria-label="Start a new conversation"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
        </div>

        {showThreadList ? (
          <div className="flex-1 overflow-y-auto p-2">
            {sortedThreads.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
            )}
            <ul className="space-y-1">
              {sortedThreads.map((t) => {
                const isActive = t.id === activeId;
                const preview =
                  t.messages.filter((m) => m.role === "user").slice(-1)[0]?.content ??
                  t.messages[t.messages.length - 1]?.content ??
                  "";
                return (
                  <li
                    key={t.id}
                    className={cn(
                      "group flex items-start gap-2 rounded-lg border border-transparent px-3 py-2 hover:border-border hover:bg-muted/60",
                      isActive && "border-primary/30 bg-primary/10",
                    )}
                  >
                    <button
                      onClick={() => selectThread(t.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-sm font-medium text-foreground">{t.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{preview}</p>
                    </button>
                    <button
                      onClick={() => deleteThread(t.id)}
                      className="mt-0.5 rounded p-1 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      aria-label={`Delete ${t.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm",
                      message.role === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted text-foreground",
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && lastRole === "user" && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}
              {messages.length === 1 && !isLoading && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:border-primary/50 hover:bg-primary/10"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border bg-background p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about inventory, financing, hours…"
                  disabled={isLoading}
                  rows={1}
                  className="max-h-32 flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Conversations are saved in this browser only.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default MiddlemanChat;
