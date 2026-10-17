"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  Mail,
  Calendar,
  Sparkles,
  ArrowRight,
  Bot,
  Terminal,
  CheckCircle2,
} from "lucide-react";

function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const categories = [
  { id: "all", label: "All Examples" },
  { id: "github", label: "GitHub", icon: GithubIcon },
  { id: "gmail", label: "Gmail", icon: Mail },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "memory", label: "Memory", icon: Sparkles },
];

const examplePrompts = [
  {
    id: "github-1",
    category: "github",
    system: "GitHub Intelligence",
    icon: GithubIcon,
    tagColor: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    glowColor: "border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.15)]",
    prompt: "Inspect the neuron repo structure and find where JWT auth is handled",
    response:
      "Inspected repository files: located auth middleware in backend/app/api/v1/auth.py and token secret in core/config.py.",
  },
  {
    id: "gmail-1",
    category: "gmail",
    system: "Live Gmail",
    icon: Mail,
    tagColor: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    glowColor: "border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.15)]",
    prompt: "Summarize recent emails from the college placement cell",
    response:
      "Found 2 recent emails regarding upcoming interview rounds and eligibility criteria for campus drives.",
  },
  {
    id: "calendar-1",
    category: "calendar",
    system: "Google Calendar",
    icon: Calendar,
    tagColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    glowColor: "border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)]",
    prompt: "What meetings and events do I have scheduled for tomorrow?",
    response:
      "You have 2 scheduled events tomorrow: Sprint Standup at 10:30 AM and Architecture Review at 3:00 PM.",
  },
  {
    id: "rag-1",
    category: "memory",
    system: "Second Brain Memory",
    icon: Sparkles,
    tagColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    glowColor: "border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]",
    prompt: "Synthesize my past recruiter discussions and internship offers",
    response:
      "Synthesized historical emails: retrieved offer timelines, compensation details, and recruiter contacts across past discussions.",
  },
];

export function IntegrationCard() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activePromptId, setActivePromptId] = useState("github-1");
  const [isPaused, setIsPaused] = useState(false);

  const filteredPrompts =
    selectedCategory === "all"
      ? examplePrompts
      : examplePrompts.filter((p) => p.category === selectedCategory);

  // Auto-cycle through example prompts when not hovered
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActivePromptId((currentId) => {
        const currentIndex = filteredPrompts.findIndex((p) => p.id === currentId);
        const nextIndex =
          currentIndex === -1 ? 0 : (currentIndex + 1) % filteredPrompts.length;
        return filteredPrompts[nextIndex].id;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [filteredPrompts, isPaused]);

  // If active prompt is outside the filtered list, reset to first item
  useEffect(() => {
    if (!filteredPrompts.some((p) => p.id === activePromptId)) {
      if (filteredPrompts.length > 0) {
        setActivePromptId(filteredPrompts[0].id);
      }
    }
  }, [selectedCategory, filteredPrompts, activePromptId]);

  return (
    <Card
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full overflow-hidden rounded-2xl border border-white/15 bg-[#090c13]/90 p-0 text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
    >
      {/* Top Window Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="size-2.5 rounded-full bg-white/20" />
          </div>
          <span className="ml-2 font-mono text-[11px] text-white/50">
            neuron.ai / prompt-showcase
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-300">
            Interactive
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 bg-white/[0.015] px-4 py-2.5 sm:px-5">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                isSelected
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              {cat.icon && <cat.icon className="size-3" />}
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Interactive Example Prompts List */}
      <div className="flex flex-col gap-2.5 p-4 sm:p-5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
          Example prompts you can ask:
        </span>

        <div className="space-y-2">
          {filteredPrompts.map((item) => {
            const isActive = activePromptId === item.id;
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                onClick={() => setActivePromptId(item.id)}
                className={`group cursor-pointer rounded-xl border p-3 transition-all duration-300 ${
                  isActive
                    ? `bg-white/[0.06] ${item.glowColor}`
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border ${item.tagColor}`}
                    >
                      <Icon className="size-3.5" />
                    </span>

                    <div>
                      <p className="text-xs font-medium leading-relaxed text-white/90 sm:text-sm">
                        "{item.prompt}"
                      </p>

                      {/* Expanded response preview when active */}
                      {isActive && (
                        <div className="mt-2.5 rounded-lg border border-white/10 bg-black/40 p-2.5">
                          <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/50 mb-1">
                            <Bot className="size-3 text-violet-400" />
                            <span>Neuron Agent Response:</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-white/70 sm:text-xs">
                            {item.response}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${item.tagColor}`}
                  >
                    {item.system}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Simulated Input Bar */}
      <div className="border-t border-white/10 bg-white/[0.02] p-4 sm:px-5">
        <button
          onClick={() => navigate("/login")}
          className="group flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-left text-xs text-white/50 transition-all hover:border-white/30 hover:bg-white/[0.04] hover:text-white"
        >
          <div className="flex items-center gap-2">
            <Terminal className="size-3.5 text-violet-400" />
            <span className="truncate">Ask Neuron anything about your workspace…</span>
          </div>

          <span className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/70 group-hover:bg-white/20 group-hover:text-white">
            <span>Try it</span>
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-white/40 font-mono">
          <span>Connected: Gmail, Calendar, GitHub</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="size-3" /> Ready
          </span>
        </div>
      </div>
    </Card>
  );
}
