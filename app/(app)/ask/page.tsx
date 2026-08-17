"use client";
// app/(app)/ask/page.tsx
// Ask LOOP — Database-Backed AI Copilot with Expandable History Sidebar & Warm Sunset Halo

import { useState, useEffect } from "react";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";
import { SentimentBadge, ChannelBadge } from "@/components/ui/Badge";
import type { Feedback, Sentiment, Channel } from "@/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citedItems?: Feedback[];
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

// Universal query examples applicable across all workspaces, themes, and feature areas
const EXAMPLE_QUERIES = [
  "What are the most frequent customer complaints across all areas?",
  "Which features are driving the highest positive sentiment?",
  "What are the top requested product improvements?",
  "Where is customer friction impacting user retention most?",
];

/**
 * Rich Formatter component for AI responses
 */
function FormattedAnswer({ content }: { content: string }) {
  const blocks = content.split("\n\n");

  return (
    <div className="space-y-4 text-xs leading-relaxed text-slate-800">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Headings: ### Section Title
        if (trimmed.startsWith("### ")) {
          const title = trimmed.replace(/^###\s+/, "");
          return (
            <div key={bIdx} className="pt-3 border-t border-slate-100 first:pt-0 first:border-none">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-600" />
                {title}
              </h4>
            </div>
          );
        }

        // Quote Item: [1] (support_ticket, NEG): "..."
        const quoteMatch = trimmed.match(/^(\*\*|\s*)*\[(\d+)\](\*\*)*\s*\(([^,]+),\s*([^)]+)\):\s*"([\s\S]*)"$/);
        if (quoteMatch) {
          const num = quoteMatch[2];
          const channelStr = quoteMatch[4].trim() as Channel;
          const sentimentStr = quoteMatch[5].trim() as Sentiment;
          const quoteText = quoteMatch[6];

          return (
            <div key={bIdx} className="p-3 bg-slate-50 border-l-2 border-violet-500 rounded-r-lg space-y-1.5 my-2">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 font-mono text-[10px] font-bold">
                  [{num}]
                </span>
                <ChannelBadge channel={channelStr} />
                <SentimentBadge sentiment={sentimentStr} />
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">&ldquo;{quoteText}&rdquo;</p>
            </div>
          );
        }

        // Sources line: Sources: [1], [2]
        if (trimmed.toLowerCase().startsWith("sources:")) {
          const sourcesStr = trimmed.replace(/^sources:\s*/i, "");
          const sourcePills = sourcesStr.match(/\[\d+\]/g) || [sourcesStr];
          return (
            <div key={bIdx} className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sources:</span>
              <div className="flex flex-wrap gap-1">
                {sourcePills.map((pill, pIdx) => (
                  <span
                    key={pIdx}
                    className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 font-mono text-[11px] font-semibold border border-violet-100"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          );
        }

        // Bullet points
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split("\n").map((l) => l.replace(/^[-*]\s+/, ""));
          return (
            <ul key={bIdx} className="space-y-1.5 pl-2">
              {items.map((item, iIdx) => (
                <li key={iIdx} className="flex items-start gap-2 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        // Standard Paragraph
        return (
          <p key={bIdx} className="text-slate-700 leading-relaxed">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

export default function AskPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 1. Fetch all chat sessions from Database on mount
  const fetchSessions = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch("/api/chats");
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setSessions(json.data);
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // 2. Fetch active chat detail when currentSessionId changes
  useEffect(() => {
    if (!currentSessionId) {
      setCurrentChat(null);
      return;
    }

    const fetchChatDetail = async () => {
      try {
        const res = await fetch(`/api/chats/${currentSessionId}`);
        const json = await res.json();
        if (json.data) {
          setCurrentChat(json.data);
        }
      } catch (err) {
        console.error("Failed to load chat details:", err);
      }
    };

    fetchChatDetail();
  }, [currentSessionId]);

  // Start a fresh chat
  const handleNewChat = () => {
    setCurrentSessionId(null);
    setCurrentChat(null);
    setQuestion("");
  };

  // Delete chat session from Database
  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chats/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (currentSessionId === id) {
          setCurrentSessionId(null);
          setCurrentChat(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  // Send message to Database API
  const handleAsk = async (qText: string) => {
    const q = qText.trim();
    if (!q || loading) return;

    setQuestion("");
    setLoading(true);

    try {
      let activeId = currentSessionId;

      // Create new session in Database if none active
      if (!activeId) {
        const createRes = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: q.slice(0, 36) + (q.length > 36 ? "..." : ""),
          }),
        });
        const createJson = await createRes.json();
        if (createJson.data) {
          activeId = createJson.data.id;
          setCurrentSessionId(activeId);
          setSessions((prev) => [createJson.data, ...prev]);
        }
      }

      if (!activeId) return;

      // Add temporary optimistic user message
      const tempUserMsg: Message = {
        id: "temp-" + Date.now(),
        role: "user",
        content: q,
      };

      setCurrentChat((prev) => ({
        id: activeId!,
        title: prev?.title || q.slice(0, 36),
        createdAt: prev?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [...(prev?.messages || []), tempUserMsg],
      }));

      // Call Chat Message API (saves to DB and returns AI analysis)
      const res = await fetch(`/api/chats/${activeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const json = await res.json();

      if (json.data?.answer) {
        const assistantMsg: Message = {
          id: json.data.messageId || Date.now().toString(),
          role: "assistant",
          content: json.data.answer,
          citedItems: json.data.citedItems,
        };

        setCurrentChat((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            title: json.data.title || prev.title,
            messages: [...prev.messages.filter((m) => !m.id.startsWith("temp-")), tempUserMsg, assistantMsg],
          };
        });

        // Update title in sessions list
        if (json.data.title) {
          setSessions((prev) =>
            prev.map((s) => (s.id === activeId ? { ...s, title: json.data.title } : s))
          );
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  const messages = currentChat?.messages || [];

  return (
    <div className="max-w-7xl mx-auto flex gap-4 h-[calc(100vh-6.5rem)] animate-fade-in relative">
      {/* Left Expandable / Collapsible Chat History Panel */}
      <div
        className={`${
          sidebarOpen ? "w-64 sm:w-72" : "w-14"
        } shrink-0 bg-white border border-slate-200/80 rounded-2xl flex flex-col transition-all duration-300 ease-in-out shadow-xs overflow-hidden`}
      >
        {/* Top Control Bar with Expand/Collapse Toggle */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50">
          {sidebarOpen ? (
            <>
              <button
                onClick={handleNewChat}
                id="new-chat-btn"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-950 hover:bg-black text-white text-xs font-bold shadow-xs transition-all cursor-pointer hover:shadow-sm"
              >
                <span className="text-sm leading-none font-black">+</span>
                <span>New Chat</span>
              </button>

              <button
                onClick={() => setSidebarOpen(false)}
                title="Collapse sidebar"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </>
          ) : (
            <div className="w-full flex flex-col items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                title="Expand chat history"
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={handleNewChat}
                title="New Chat"
                className="w-8 h-8 rounded-xl bg-slate-950 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <span className="text-base leading-none font-bold">+</span>
              </button>
            </div>
          )}
        </div>

        {/* Database Chat History List */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            <div className="flex items-center justify-between px-2 pt-1 pb-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Chat History ({sessions.length})
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                PostgreSQL
              </span>
            </div>

            {historyLoading ? (
              <div className="space-y-2 p-2">
                <div className="h-8 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-8 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-8 bg-slate-100 rounded-xl animate-pulse" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs italic">
                No past chats found.<br />Start your first inquiry!
              </div>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setCurrentSessionId(s.id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    currentSessionId === s.id
                      ? "bg-violet-50 text-violet-900 font-bold border border-violet-200/80 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <span className="text-sm shrink-0">💬</span>
                    <span className="truncate">{s.title}</span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                    title="Delete chat from database"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {messages.length === 0 ? (
          /* HERO LAYOUT WITH FULL EMBEDDED SUNSET ORANGE HALO */
          <div className="flex-1 flex flex-col items-center justify-center px-4 relative overflow-y-auto py-8">
            <div className="relative w-full max-w-2xl space-y-8 text-center my-auto">
              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                What can I help with?
              </h1>

              {/* Elevated Floating Input Card with Ambient Warm Orange Halo */}
              <div className="relative group">
                {/* 360-degree Warm Sunset Orange & Amber Radiant Aura */}
                <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-amber-400/45 via-orange-500/40 to-rose-400/30 rounded-[36px] blur-2xl pointer-events-none transition-all duration-500 group-hover:blur-3xl group-hover:from-amber-400/55 group-hover:via-orange-500/50 -z-10" />

                <div className="relative bg-white/95 backdrop-blur-md border border-orange-200/90 rounded-3xl p-5 shadow-[0_15px_45px_-8px_rgba(251,146,60,0.32)] hover:shadow-[0_20px_55px_-8px_rgba(251,146,60,0.42)] transition-all text-left space-y-4">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAsk(question);
                      }
                    }}
                    placeholder="Ask AI anything about your customer feedback..."
                    rows={3}
                    className="w-full text-sm text-slate-800 placeholder-slate-400 resize-none outline-none bg-transparent font-medium"
                  />

                  {/* Bottom Bar: Black Circle Upward Arrow Submit Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100/90">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-600 bg-orange-50/80 px-2.5 py-1 rounded-full border border-orange-200/60">
                      <span>✨</span>
                      <span>AI Copilot • PostgreSQL Active</span>
                    </div>

                    <button
                      onClick={() => handleAsk(question)}
                      disabled={!question.trim() || loading}
                      className="w-8 h-8 rounded-full bg-slate-900 hover:bg-black text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Universal Examples of Queries (Applicable to All Themes & Fields) */}
              <div className="space-y-3 text-left max-w-xl mx-auto pt-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Examples of queries:</p>
                <div className="space-y-2">
                  {EXAMPLE_QUERIES.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleAsk(q)}
                      className="w-full text-left text-xs px-4 py-3 rounded-2xl border border-slate-200/80 hover:border-orange-300 hover:bg-orange-50/40 transition-all text-slate-700 flex items-center justify-between group cursor-pointer bg-white/70 shadow-2xs"
                    >
                      <span className="font-medium">{q}</span>
                      <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE CONVERSATION FLOW */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 py-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  {msg.role === "user" ? (
                    <div className="p-3.5 px-4 rounded-2xl max-w-xl text-xs font-medium leading-relaxed bg-slate-900 text-white rounded-br-none shadow-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="bg-white p-6 max-w-3xl border border-slate-100 rounded-2xl rounded-bl-none shadow-sm space-y-4 w-full">
                      <FormattedAnswer content={msg.content} />
                    </div>
                  )}

                  {msg.citedItems && msg.citedItems.length > 0 && (
                    <div className="mt-4 w-full space-y-2.5 pl-4 border-l-2 border-orange-500">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Cited Customer Evidence ({msg.citedItems.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {msg.citedItems.map((item) => (
                          <FeedbackCard key={item.id} feedback={item} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 p-4 bg-white border border-slate-200 rounded-2xl w-32 shadow-sm">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              )}
            </div>

            {/* Input bar in active chat */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk(question);
              }}
              className="flex gap-2.5 pt-3 border-t border-slate-200/80 mt-auto"
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything about customer feedback..."
                className="input-base flex-1"
                id="ask-input"
              />
              <button
                type="submit"
                disabled={!question.trim() || loading}
                className="w-9 h-9 rounded-full bg-slate-900 hover:bg-black text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-all shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
