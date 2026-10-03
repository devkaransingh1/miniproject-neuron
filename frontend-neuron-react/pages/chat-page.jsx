import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  LoaderCircle,
  LogOut,
  Menu,
  MessageSquare,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Send,
  Settings,
  Sparkles,
  Square,
  UserRound,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { useAuth } from "@/components/auth/use-auth";
import { ApiError } from "@/lib/api-client";
import {
  getConversation,
  getConversations,
  sendChatMessage,
} from "@/services/chat-api";

const suggestedPrompts = [
  "Summarize my recent emails",
  "Help me plan my week",
  "What can you help me with?",
];

function initials(name = "Neuron user") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function newId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
}

function parseAssistantMessage(content) {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object" && "content" in parsed) {
      return {
        content: String(parsed.content ?? ""),
        type: parsed.type === "email" ? "email" : "text",
        data: parsed.data ?? null,
      };
    }
  } catch {
    // Older history entries can contain plain text.
  }

  return { content, type: "text", data: null };
}

function normalizeHistory(history) {
  return history.messages.map((message) => {
    if (message.role !== "assistant") {
      return {
        id: `message-${message.id}`,
        role: "user",
        content: message.content,
        createdAt: message.created_at,
      };
    }

    return {
      id: `message-${message.id}`,
      role: "assistant",
      ...parseAssistantMessage(message.content),
      createdAt: message.created_at,
    };
  });
}

function EmptyState({ onPrompt }) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-5 py-12 text-center">
      <div className="mb-6 flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035]">
        <Sparkles className="size-5 text-white/75" />
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">
        Your personal context, connected
      </p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-white sm:text-5xl">
        What’s on your mind?
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-white/45">
        Ask Neuron about your connected information, or start with one of these.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2.5">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPrompt(prompt)}
            className="rounded-full border border-white/10 bg-white/[0.025] px-4 py-2.5 text-xs text-white/65 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmailSources({ emails = [] }) {
  if (!emails.length) return null;

  return (
    <details className="group mt-4 rounded-xl border border-white/10 bg-white/[0.02]">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-xs text-white/65 marker:hidden">
        <ChevronRight className="size-3.5 transition-transform group-open:rotate-90" />
        <span>Sources from your email</span>
        <span className="ml-auto rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-white/45">
          {emails.length}
        </span>
      </summary>
      <div className="space-y-2 border-t border-white/8 p-3">
        {emails.map((email, index) => (
          <article
            key={`${email.message_id || email.thread_id || index}`}
            className="rounded-lg border border-white/[0.06] bg-black/30 p-3"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-sm font-medium text-white/85">
                {email.subject || "Email"}
              </h3>
              <time className="text-[11px] text-white/35">{email.date}</time>
            </div>
            <p className="mt-1 text-xs text-white/45">
              {email.sender}
              {email.recipient ? ` → ${email.recipient}` : ""}
            </p>
            {email.content && (
              <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-xs leading-5 text-white/60">
                {email.content}
              </p>
            )}
          </article>
        ))}
      </div>
    </details>
  );
}

function AnalysisSummary() {
  return (
    <details className="group mt-4 text-xs text-white/45">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 transition-colors hover:text-white/70">
        <ChevronRight className="size-3 transition-transform group-open:rotate-90" />
        View answer overview
      </summary>
      <ul className="mt-3 space-y-2 border-l border-white/10 pl-4 text-white/40">
        <li className="flex items-center gap-2">
          <Check className="size-3 text-white/50" />
          Understood the question
        </li>
        <li className="flex items-center gap-2">
          <Check className="size-3 text-white/50" />
          Gathered relevant context
        </li>
        <li className="flex items-center gap-2">
          <Check className="size-3 text-white/50" />
          Prepared a concise response
        </li>
      </ul>
    </details>
  );
}

function AssistantMark() {
  return (
    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
      <Sparkles className="size-4 text-white/75" />
    </div>
  );
}

function ChatMessage({ message }) {
  if (message.role === "user") {
    return (
      <article className="flex justify-end py-3">
        <div className="max-w-[min(82%,44rem)] rounded-2xl rounded-br-md border border-white/[0.07] bg-[#191919] px-4 py-3 text-sm leading-6 text-white/90 sm:px-5">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="flex gap-3 py-5 sm:gap-4">
      <AssistantMark />
      <div className="min-w-0 flex-1 pt-1">
        <p className="mb-2 text-xs font-medium text-white/75">Neuron</p>
        {message.isLoading ? (
          <div className="flex items-center gap-2 py-2 text-sm text-white/45">
            <LoaderCircle className="size-4 animate-spin" />
            Thinking
            <span className="animate-pulse">…</span>
          </div>
        ) : (
          <>
            <ChatMarkdown content={message.content} />
            {message.type === "email" && (
              <EmailSources emails={message.data?.emails || []} />
            )}
            {!message.isStopped && <AnalysisSummary />}
          </>
        )}
      </div>
    </article>
  );
}

function ConversationRow({ conversation, selected, onSelect, collapsed }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      title={conversation.title || "New conversation"}
      className={`group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors ${
        selected
          ? "bg-white/[0.075] text-white"
          : "text-white/55 hover:bg-white/[0.045] hover:text-white/85"
      }`}
    >
      <MessageSquare className="size-3.5 shrink-0 text-white/35" />
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate text-xs">
            {conversation.title || "New conversation"}
          </span>
          <time className="hidden shrink-0 text-[10px] text-white/30 group-hover:inline">
            {formatDate(conversation.created_at)}
          </time>
        </>
      )}
    </button>
  );
}

export function ChatPage() {
  const { user, logout, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [conversationTitle, setConversationTitle] = useState("New chat");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversationError, setConversationError] = useState("");
  const [sendError, setSendError] = useState("");
  const [sidebarError, setSidebarError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profilePanel, setProfilePanel] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const messageListRef = useRef(null);
  const composerRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);
  const sendControllerRef = useRef(null);
  const historyControllerRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const result = await getConversations();
      setConversations(Array.isArray(result) ? result : []);
      setSidebarError("");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        refreshAuth();
        return;
      }
      setSidebarError("Could not load recent chats.");
    }
  }, [refreshAuth]);

  useEffect(() => {
    let active = true;
    getConversations()
      .then((result) => {
        if (!active) return;
        setConversations(Array.isArray(result) ? result : []);
        setSidebarError("");
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          refreshAuth();
          return;
        }
        setSidebarError("Could not load recent chats.");
      });
    return () => {
      active = false;
      sendControllerRef.current?.abort();
      historyControllerRef.current?.abort();
    };
  }, [refreshAuth]);

  useLayoutEffect(() => {
    if (!shouldStickToBottomRef.current) return;
    const list = messageListRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const beginNewChat = () => {
    sendControllerRef.current?.abort();
    historyControllerRef.current?.abort();
    setConversationId(null);
    setConversationTitle("New chat");
    setMessages([]);
    setConversationError("");
    setSendError("");
    setIsSending(false);
    setIsLoadingHistory(false);
    shouldStickToBottomRef.current = true;
    setIsSidebarOpen(false);
    composerRef.current?.focus();
  };

  const openConversation = async (conversation) => {
    historyControllerRef.current?.abort();
    sendControllerRef.current?.abort();
    const controller = new AbortController();
    historyControllerRef.current = controller;
    setConversationId(conversation.id);
    setConversationTitle(conversation.title || "Untitled conversation");
    setMessages([]);
    setConversationError("");
    setSendError("");
    setIsLoadingHistory(true);
    setIsSending(false);
    shouldStickToBottomRef.current = true;
    setIsSidebarOpen(false);

    try {
      const history = await getConversation(conversation.id, controller.signal);
      if (controller.signal.aborted) return;
      setMessages(normalizeHistory(history));
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof ApiError && error.status === 401) {
        refreshAuth();
        return;
      }
      setConversationError(
        error instanceof ApiError && error.status === 404
          ? "This conversation could not be found."
          : "Could not load this conversation. Please try again.",
      );
    } finally {
      if (!controller.signal.aborted) setIsLoadingHistory(false);
    }
  };

  const sendMessage = async (eventOrText) => {
    eventOrText?.preventDefault?.();
    const text = (typeof eventOrText === "string" ? eventOrText : draft).trim();
    if (!text || isSending) return;

    const controller = new AbortController();
    sendControllerRef.current = controller;
    const userMessage = {
      id: newId(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    const assistantId = newId();

    setDraft("");
    setSendError("");
    setConversationError("");
    setMessages((current) => [
      ...current,
      userMessage,
      { id: assistantId, role: "assistant", content: "", isLoading: true },
    ]);
    setConversationTitle((current) =>
      current === "New chat" ? text.slice(0, 52) : current,
    );
    setIsSending(true);
    shouldStickToBottomRef.current = true;
    if (composerRef.current) composerRef.current.style.height = "auto";

    try {
      const result = await sendChatMessage(text, conversationId, controller.signal);
      if (controller.signal.aborted) return;

      setConversationId(result.conversation_id);
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: result.response?.content || "",
                type: result.response?.type === "email" ? "email" : "text",
                data: result.response?.data ?? null,
                isLoading: false,
              }
            : message,
        ),
      );
      await loadConversations();
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof ApiError && error.status === 401) {
        refreshAuth();
        return;
      }
      setMessages((current) =>
        current.filter((message) => message.id !== assistantId),
      );
      setSendError(
        error instanceof Error
          ? error.message
          : "Your message could not be sent. Please try again.",
      );
    } finally {
      if (!controller.signal.aborted) setIsSending(false);
      if (sendControllerRef.current === controller) {
        sendControllerRef.current = null;
      }
    }
  };

  const stopGeneration = () => {
    sendControllerRef.current?.abort();
    sendControllerRef.current = null;
    setIsSending(false);
    setMessages((current) =>
      current.map((message) =>
        message.isLoading
          ? {
              ...message,
              content: "Generation stopped.",
              isLoading: false,
              isStopped: true,
            }
          : message,
      ),
    );
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      setSendError(
        error instanceof Error ? error.message : "Unable to log out.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleComposerChange = (event) => {
    setDraft(event.target.value);
    event.target.style.height = "auto";
    event.target.style.height = `${Math.min(event.target.scrollHeight, 192)}px`;
  };

  const profileName = user?.name || "Neuron user";

  return (
    <main className="flex h-[100dvh] overflow-hidden bg-[#080808] text-white">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[286px] shrink-0 flex-col border-r border-white/[0.075] bg-[#0b0b0b] transition-[width,transform] duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isSidebarCollapsed ? "lg:w-[76px]" : "lg:w-[286px]"}`}
      >
        <div
          className={`flex h-[68px] items-center border-b border-white/[0.06] px-4 ${
            isSidebarCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <Link
            to="/chat"
            className={`flex items-center gap-2.5 ${
              isSidebarCollapsed ? "lg:justify-center" : ""
            }`}
          >
            <span className="flex size-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
              <Sparkles className="size-4 text-white/80" />
            </span>
            {!isSidebarCollapsed && (
              <>
                <span className="font-display text-lg tracking-tight">NEURON</span>
                <span className="mt-0.5 size-1.5 rounded-full bg-emerald-400/80" />
              </>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
            className={`hidden rounded-lg p-2 text-white/35 transition-colors hover:bg-white/5 hover:text-white lg:block ${
              isSidebarCollapsed ? "absolute right-3" : ""
            }`}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </button>
        </div>

        <div
          className={`px-3 pt-4 ${
            isSidebarCollapsed ? "lg:flex lg:justify-center lg:px-2" : ""
          }`}
        >
          <button
            type="button"
            onClick={beginNewChat}
            aria-label={isSidebarCollapsed ? "New chat" : undefined}
            title={isSidebarCollapsed ? "New chat" : undefined}
            className={`flex h-10 w-full items-center gap-2.5 rounded-lg border border-white/[0.12] bg-white/[0.055] px-3 text-sm text-white/85 transition-colors hover:border-white/20 hover:bg-white/[0.09] ${
              isSidebarCollapsed ? "lg:w-10 lg:justify-center lg:px-0" : ""
            }`}
          >
            <Plus className="size-4" />
            {!isSidebarCollapsed && (
              <>
                <span>New chat</span>
                <span className="ml-auto rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-white/30">
                  N
                </span>
              </>
            )}
          </button>
        </div>

        <section
          className={`mt-7 flex min-h-0 flex-1 flex-col px-3 ${
            isSidebarCollapsed ? "lg:px-2" : ""
          }`}
        >
          <div
            className={`mb-2 flex items-center justify-between px-2 ${
              isSidebarCollapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            {!isSidebarCollapsed && (
              <h2 className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
                Recent chats
              </h2>
            )}
            <Clock3 className="size-3.5 text-white/25" />
          </div>
          <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain pr-1">
            {sidebarError ? (
              <div className="px-2 py-3 text-xs leading-5 text-white/35">
                {sidebarError}
                <button
                  type="button"
                  onClick={loadConversations}
                  className="ml-1 text-white/60 underline underline-offset-2"
                >
                  Retry
                </button>
              </div>
            ) : conversations.length ? (
              conversations.map((conversation) => (
                <ConversationRow
                  key={conversation.id}
                  conversation={conversation}
                  selected={conversationId === conversation.id}
                  collapsed={isSidebarCollapsed}
                  onSelect={() => openConversation(conversation)}
                />
              ))
            ) : (
              <p className="px-2 py-3 text-xs leading-5 text-white/30">
                Your conversations will appear here.
              </p>
            )}
          </div>
        </section>

        <div
          className={`relative mt-auto border-t border-white/[0.07] p-3 ${
            isSidebarCollapsed ? "lg:flex lg:justify-center lg:px-2" : ""
          }`}
        >
          {isProfileMenuOpen && (
            <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 z-20 rounded-xl border border-white/10 bg-[#151515] p-1.5 shadow-2xl">
              <div className="border-b border-white/[0.07] px-3 py-2.5">
                <p className="truncate text-xs font-medium text-white/85">
                  {profileName}
                </p>
                <p className="mt-1 truncate text-[11px] text-white/40">
                  {user?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProfilePanel("profile")}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs text-white/65 hover:bg-white/[0.05] hover:text-white"
              >
                <UserRound className="size-3.5" />
                Profile
              </button>
              <button
                type="button"
                onClick={() => setProfilePanel("settings")}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs text-white/65 hover:bg-white/[0.05] hover:text-white"
              >
                <Settings className="size-3.5" />
                Settings
              </button>
              <div className="my-1 border-t border-white/[0.07]" />
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs text-white/65 transition-colors hover:bg-red-400/[0.08] hover:text-red-300 disabled:opacity-40"
              >
                <LogOut className="size-3.5" />
                {isLoggingOut ? "Logging out…" : "Log out"}
              </button>
            </div>
          )}

          {profilePanel && (
            <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 z-30 rounded-xl border border-white/10 bg-[#151515] p-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  {profilePanel === "profile" ? "Profile" : "Settings"}
                </h3>
                <button
                  type="button"
                  onClick={() => setProfilePanel("")}
                  className="text-white/40 hover:text-white"
                  aria-label="Close profile panel"
                >
                  <X className="size-4" />
                </button>
              </div>
              {profilePanel === "profile" ? (
                <div className="mt-4 flex items-center gap-3">
                  <ProfileAvatar user={user} />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white/85">
                      {profileName}
                    </p>
                    <p className="truncate text-xs text-white/40">
                      {user?.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs leading-5 text-white/45">
                  Workspace preferences will be available here.
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setProfilePanel("");
              setIsProfileMenuOpen((open) => !open);
            }}
            title={isSidebarCollapsed ? profileName : undefined}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.045]"
            aria-expanded={isProfileMenuOpen}
          >
            <ProfileAvatar user={user} />
            {!isSidebarCollapsed && (
              <>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-xs font-medium text-white/80">
                    {profileName}
                  </span>
                  <span className="mt-1 block truncate text-[10px] text-white/35">
                    {user?.email || "Signed in"}
                  </span>
                </span>
                <ChevronDown
                  className={`size-4 text-white/35 transition-transform ${
                    isProfileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
          </button>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-white/[0.07] px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-2 text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="size-4" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-medium text-white/85">
                {conversationTitle}
              </h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/35">
                <span className="size-1.5 rounded-full bg-emerald-400/70" />
                Neuron Assistant
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={beginNewChat}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/55 transition-colors hover:bg-white/[0.05] hover:text-white sm:px-4"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">New chat</span>
          </button>
        </header>

        <div
          ref={messageListRef}
          onScroll={(event) => {
            const element = event.currentTarget;
            shouldStickToBottomRef.current =
              element.scrollHeight - element.scrollTop - element.clientHeight <
              100;
          }}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth"
        >
          {isLoadingHistory ? (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-white/40">
              <LoaderCircle className="size-4 animate-spin" />
              Loading conversation…
            </div>
          ) : messages.length ? (
            <div className="mx-auto w-full max-w-3xl px-5 pb-8 pt-6 sm:px-8">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {conversationError && (
                <p role="alert" className="py-4 text-sm text-red-300/80">
                  {conversationError}
                </p>
              )}
            </div>
          ) : conversationError ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <p role="alert" className="text-sm text-red-300/80">
                {conversationError}
              </p>
              <button
                type="button"
                onClick={() => {
                  const conversation = conversations.find(
                    (item) => item.id === conversationId,
                  );
                  if (conversation) openConversation(conversation);
                }}
                className="mt-4 rounded-full border border-white/10 px-4 py-2 text-xs text-white/70 hover:bg-white/5"
              >
                Try again
              </button>
            </div>
          ) : (
            <EmptyState onPrompt={(prompt) => sendMessage(prompt)} />
          )}
        </div>

        <div className="shrink-0 px-4 pb-3 pt-3 sm:px-6 sm:pb-5">
          <form
            onSubmit={sendMessage}
            className="mx-auto w-full max-w-3xl"
          >
            {sendError && (
              <div
                role="alert"
                className="mb-3 flex items-center justify-between rounded-lg border border-red-300/15 bg-red-300/[0.04] px-3 py-2 text-xs text-red-200/80"
              >
                <span>{sendError}</span>
                <button
                  type="button"
                  onClick={() => setSendError("")}
                  aria-label="Dismiss error"
                  className="ml-3 text-red-200/60 hover:text-red-100"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}
            <div className="rounded-2xl border border-white/[0.12] bg-[#111111] p-2 shadow-[0_12px_45px_rgba(0,0,0,0.3)] transition-colors focus-within:border-white/20">
              <textarea
                ref={composerRef}
                value={draft}
                onChange={handleComposerChange}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                rows={1}
                placeholder="Message Neuron…"
                aria-label="Message Neuron"
                className="max-h-48 min-h-12 w-full resize-none bg-transparent px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/30"
              />
              <div className="flex items-center justify-between px-1 pb-1">
                <div className="flex items-center gap-1.5 pl-1 text-[10px] text-white/30">
                  <span className="hidden sm:inline">
                    Your connected context is private
                  </span>
                  <span className="sm:hidden">Private context</span>
                </div>
                <div className="flex items-center gap-2">
                  {!draft.trim() && !isSending && (
                    <button
                      type="button"
                      disabled
                      title="Voice input coming soon"
                      aria-label="Voice input coming soon"
                      className="rounded-lg p-2 text-white/25"
                    >
                      <Mic className="size-4" />
                    </button>
                  )}
                  {isSending ? (
                    <button
                      type="button"
                      onClick={stopGeneration}
                      className="flex size-9 items-center justify-center rounded-xl bg-white text-black transition-colors hover:bg-white/85"
                      aria-label="Stop response"
                    >
                      <Square className="size-3.5 fill-current" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!draft.trim()}
                      className="flex size-9 items-center justify-center rounded-xl bg-white text-black transition-all hover:bg-white/85 disabled:cursor-not-allowed disabled:bg-white/[0.08] disabled:text-white/25"
                      aria-label="Send message"
                    >
                      <Send className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-2 text-center text-[10px] text-white/25">
              Neuron can make mistakes. Verify important information.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

function ProfileAvatar({ user }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (user?.picture_url && !imageFailed) {
    return (
      <img
        src={user.picture_url}
        alt=""
        onError={() => setImageFailed(true)}
        className="size-9 shrink-0 rounded-full border border-white/10 object-cover"
      />
    );
  }

  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-[11px] font-medium text-white/70">
      {initials(user?.name)}
    </span>
  );
}
