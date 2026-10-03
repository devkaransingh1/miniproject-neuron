import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowDown,
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
import {
  getGmailSyncStatus,
  getIntegrationStatus,
  startCalendarConnect,
  startGmailConnect,
} from "@/services/integrations-api";

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

async function revealAssistantResponse(content, onUpdate, signal) {
  const chunks = content.match(/\S+\s*/g) || [];
  let visibleContent = "";

  for (let index = 0; index < chunks.length; index += 16) {
    if (signal.aborted) return;

    visibleContent += chunks.slice(index, index + 16).join("");
    onUpdate(visibleContent);

    await new Promise((resolve) => window.setTimeout(resolve, 5));
  }
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
    <div className="chat-empty-state mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-5 py-12 text-center">
      <div className="chat-orbit mb-7 flex size-16 items-center justify-center rounded-[22px] border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.015] shadow-[0_16px_60px_rgba(75,130,255,0.1)]">
        <Sparkles className="size-6 text-sky-100/85" />
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-sky-100/45">
        A clearer space to think
      </p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-white sm:text-6xl">
        What’s on your mind?
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-6 text-white/45 sm:text-[15px]">
        Your ideas, questions, and connected context—together in one place.
      </p>
      <div className="mt-9 flex max-w-2xl flex-wrap justify-center gap-2.5">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPrompt(prompt)}
            className="chat-prompt-chip rounded-full border border-white/[0.09] bg-white/[0.025] px-4 py-2.5 text-xs text-white/60 transition-colors hover:border-sky-200/20 hover:bg-sky-200/[0.055] hover:text-white"
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
    <div className="chat-assistant-mark mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border border-sky-200/[0.12] bg-gradient-to-br from-sky-200/[0.09] to-white/[0.025]">
      <Sparkles className="size-4 text-sky-100/80" />
    </div>
  );
}

function ChatMessage({ message }) {
  if (message.role === "user") {
    return (
      <article
        data-message-id={message.id}
        className="chat-message-enter flex min-w-0 justify-end py-3"
      >
        <div className="max-w-[min(88%,44rem)] rounded-[20px] rounded-br-md border border-sky-200/[0.12] bg-gradient-to-br from-[#213d68] to-[#172844] px-4 py-3 text-sm leading-6 text-white shadow-[0_8px_30px_rgba(0,0,0,0.16)] sm:px-5">
          <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
            {message.content}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article
      data-message-id={message.id}
      className="chat-message-enter flex min-w-0 gap-3 py-5 sm:gap-4"
      style={
        message.isLoading || message.isStreaming
          ? { minHeight: message.reservedHeight }
          : undefined
      }
    >
      <AssistantMark />
      <div className="min-w-0 flex-1 pt-1 [overflow-wrap:anywhere]">
        <p className="mb-2 text-xs font-medium tracking-wide text-white/55">
          Neuron
        </p>
        {message.isLoading ? (
          <div className="flex items-center gap-2 py-2 text-sm text-white/45">
            <LoaderCircle className="size-4 animate-spin" />
            Thinking
            <span className="animate-pulse">…</span>
          </div>
        ) : (
          <>
            <ChatMarkdown content={message.content} />
            {message.isStreaming && (
              <span
                aria-label="Neuron is responding"
                className="ml-0.5 inline-block h-4 w-1 animate-pulse rounded-full bg-white/70 align-middle"
              />
            )}
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

function IntegrationLogo({ name }) {
  if (name === "Gmail") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
        <path fill="#4285F4" d="M2.5 6.5v11A2.5 2.5 0 0 0 5 20h1V8.2L4 6.5z" />
        <path fill="#34A853" d="M18 8.2V20h1a2.5 2.5 0 0 0 2.5-2.5v-11L20 6.5z" />
        <path fill="#EA4335" d="M3.1 5.2A2.5 2.5 0 0 1 6.6 4.8L12 9l5.4-4.2a2.5 2.5 0 0 1 3.5.4L12 13z" />
        <path fill="#C5221F" d="M3.1 5.2 12 13v2.2L3.1 8.1a1.9 1.9 0 0 1 0-2.9z" />
        <path fill="#FBBC04" d="M20.9 5.2 12 13v2.2l8.9-7.1a1.9 1.9 0 0 0 0-2.9z" />
      </svg>
    );
  }

  if (name === "Google Calendar") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
        <path fill="#4285F4" d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
        <path fill="#1967D2" d="M17 3h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2z" />
        <path fill="#34A853" d="M3 8h3v13H5a2 2 0 0 1-2-2z" />
        <path fill="#FBBC04" d="M3 5a2 2 0 0 1 2-2h2v3H3z" />
        <path fill="#fff" d="M7 7h10v11H7z" />
        <path fill="#4285F4" d="M9 10h2v2H9zm4 0h2v2h-2zm-4 4h2v2H9zm4 0h2v2h-2z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      <path
        fill="currentColor"
        d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.63 1.22 3.27.93.1-.72.39-1.22.71-1.5-2.5-.29-5.13-1.25-5.13-5.56 0-1.23.44-2.24 1.16-3.03-.12-.29-.5-1.44.11-3 0 0 .95-.3 3.1 1.15a10.7 10.7 0 0 1 5.64 0c2.15-1.45 3.1-1.15 3.1-1.15.62 1.56.23 2.71.11 3 .72.79 1.16 1.8 1.16 3.03 0 4.32-2.63 5.27-5.14 5.55.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8z"
      />
    </svg>
  );
}

function IntegrationsPanel({
  collapsed,
  status,
  gmailSyncStatus,
  gmailSyncNotice,
  gmailSyncCheckError,
  isLoading,
  hasError,
}) {
  const integrations = [
    { key: "gmail", name: "Gmail" },
    { key: "calendar", name: "Google Calendar" },
    { key: "github", name: "GitHub" },
  ];
  const connectedCount = integrations.filter(
    ({ key }) => status?.[key] === true,
  ).length;

  return (
    <section className={`mx-3 mt-5 ${collapsed ? "lg:mx-2" : ""}`}>
      <div
        className={`mb-2 flex items-center justify-between px-2 ${
          collapsed ? "lg:justify-center lg:px-0" : ""
        }`}
      >
        <h2
          className={`text-[10px] font-medium uppercase tracking-[0.18em] text-white/35 ${
            collapsed ? "lg:hidden" : ""
          }`}
        >
          Integrations
        </h2>
        <span
          className={`rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2 py-0.5 text-[9px] text-emerald-300/75 ${
            collapsed ? "lg:hidden" : ""
          }`}
        >
          {connectedCount} connected
        </span>
      </div>
      <div
        className={`rounded-xl border border-white/[0.07] bg-white/[0.025] p-1.5 ${
          collapsed ? "lg:border-transparent lg:bg-transparent lg:p-0" : ""
        }`}
      >
        {integrations.map(({ key, name }) => {
          const connected = status?.[key];
          const isGmailSyncing =
            key === "gmail" && gmailSyncStatus === "syncing";
          const label = isGmailSyncing
            ? "Syncing"
            : isLoading
            ? "Checking"
            : hasError
              ? "Unavailable"
              : connected === true
                ? "Connected"
                : connected === false
                  ? "Not connected"
                  : "Unknown";
          const dotColor = isGmailSyncing
            ? "bg-blue-400"
            : connected === true
              ? "bg-emerald-400"
              : connected === false
                ? "bg-slate-400"
                : "bg-white/25";
          const labelColor =
            isGmailSyncing
              ? "text-blue-300"
              : connected === true
              ? "text-emerald-300"
              : connected === false
                ? "text-slate-400"
                : "text-white/35";
          const canConnectGmail =
            key === "gmail" &&
            connected === false &&
            !isLoading &&
            !hasError;
          const canConnectCalendar =
            key === "calendar" &&
            connected === false &&
            !isLoading &&
            !hasError;
          const canConnect = canConnectGmail || canConnectCalendar;
          const hoverText =
            key === "gmail"
              ? connected === true
                ? "Gmail connected"
                : canConnectGmail
                  ? "Connect Gmail"
                  : label
              : key === "calendar"
                ? connected === true
                  ? "Google Calendar connected"
                  : canConnectCalendar
                    ? "Connect Google Calendar"
                    : label
                : `${name} sync coming soon`;

          return (
            <button
              type="button"
              key={key}
              disabled={!canConnect}
              onClick={
                canConnectGmail
                  ? startGmailConnect
                  : canConnectCalendar
                    ? startCalendarConnect
                    : undefined
              }
              title={hoverText}
              aria-label={`${name}: ${label}. ${hoverText}`}
              className={`relative flex h-9 w-full items-center gap-2.5 rounded-lg px-2 text-left text-xs text-white/70 ${
                collapsed ? "lg:justify-center lg:px-0" : ""
              } ${
                canConnect
                  ? "cursor-pointer transition-colors hover:bg-white/[0.07] hover:text-white"
                  : "cursor-default"
              }`}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-white/85">
                <IntegrationLogo name={name} />
              </span>
              <span
                className={`min-w-0 flex-1 truncate ${
                  collapsed ? "lg:hidden" : ""
                }`}
              >
                {name}
              </span>
              <span
                className={`flex items-center gap-1.5 text-[10px] ${labelColor} ${
                  collapsed ? "lg:hidden" : ""
                }`}
              >
                {isGmailSyncing && (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-3 animate-spin text-blue-300"
                  />
                )}
                <span
                  aria-hidden="true"
                  className={`size-1.5 rounded-full ${
                    connected === true && isGmailSyncing
                      ? "bg-emerald-400"
                      : dotColor
                  }`}
                />
                {label}
              </span>
              {collapsed && (
                <span
                  aria-label={`${name}: ${label}`}
                  className="hidden lg:absolute lg:right-2 lg:top-1"
                >
                  {isGmailSyncing ? (
                    <>
                      <LoaderCircle
                        aria-hidden="true"
                        className="size-3 animate-spin text-blue-300"
                      />
                      {connected === true && (
                        <span
                          aria-hidden="true"
                          className="absolute -bottom-0.5 -right-0.5 size-1.5 rounded-full bg-emerald-400 ring-2 ring-[#0b0b0b]"
                        />
                      )}
                    </>
                  ) : (
                    <span
                      aria-hidden="true"
                      className={`block size-1.5 rounded-full ring-2 ring-[#0b0b0b] ${dotColor}`}
                    />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {hasError && !collapsed && (
        <p role="status" className="px-2 pt-2 text-[10px] text-white/35">
          Integration status unavailable.
        </p>
      )}
      {!collapsed && gmailSyncStatus === "syncing" && (
        <div className="mt-2 rounded-lg border border-blue-400/15 bg-blue-400/[0.05] px-3 py-2.5">
          <p className="text-[11px] font-medium text-blue-200/90">
            Syncing your latest 50 emails for context...
          </p>
          <p className="mt-1 text-[10px] leading-4 text-white/40">
            You can continue chatting while Neuron prepares your Gmail
            knowledge.
          </p>
        </div>
      )}
      {!collapsed && gmailSyncNotice === "ready" && (
        <p
          role="status"
          className="mt-2 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-2 text-[11px] text-emerald-200/85"
        >
          Gmail context is ready.
        </p>
      )}
      {!collapsed &&
        (gmailSyncNotice === "failed" || gmailSyncStatus === "failed") && (
        <p
          role="status"
          className="mt-2 rounded-lg border border-amber-400/15 bg-amber-400/[0.05] px-3 py-2 text-[11px] leading-4 text-amber-200/85"
        >
          Gmail connected, but indexing failed.
        </p>
        )}
      {!collapsed && gmailSyncCheckError && (
        <p role="status" className="px-2 pt-2 text-[10px] text-amber-200/70">
          Gmail indexing status is temporarily unavailable.
        </p>
      )}
    </section>
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
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [conversationError, setConversationError] = useState("");
  const [sendError, setSendError] = useState("");
  const [sidebarError, setSidebarError] = useState("");
  const [integrationStatus, setIntegrationStatus] = useState(null);
  const [integrationStatusError, setIntegrationStatusError] = useState(false);
  const [isLoadingIntegrationStatus, setIsLoadingIntegrationStatus] =
    useState(true);
  const [integrationStatusVersion, setIntegrationStatusVersion] = useState(0);
  const [gmailSyncStatus, setGmailSyncStatus] = useState(null);
  const [gmailSyncNotice, setGmailSyncNotice] = useState(null);
  const [gmailSyncCheckError, setGmailSyncCheckError] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profilePanel, setProfilePanel] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const messageListRef = useRef(null);
  const composerRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);
  const pendingUserMessageRef = useRef(null);
  const scrollingToBottomRef = useRef(false);
  const sendControllerRef = useRef(null);
  const historyControllerRef = useRef(null);
  const gmailSyncWasActiveRef = useRef(false);
  const gmailSyncNoticeTimerRef = useRef(null);

  const loadConversations = useCallback(async (signal) => {
    try {
      const result = await getConversations(signal);
      if (signal?.aborted) return;
      setConversations(Array.isArray(result) ? result : []);
      setSidebarError("");
    } catch (error) {
      if (signal?.aborted) return;
      if (error instanceof ApiError && error.status === 401) {
        refreshAuth();
        return;
      }
      setSidebarError("Could not load recent chats.");
    }
  }, [refreshAuth]);

  useEffect(() => {
    if (integrationStatus?.gmail !== true) {
      gmailSyncWasActiveRef.current = false;
      return undefined;
    }

    let active = true;
    let requestPending = false;
    let timerId;
    const controller = new AbortController();

    const checkGmailSyncStatus = async () => {
      if (
        !active ||
        requestPending ||
        document.visibilityState !== "visible"
      ) {
        return;
      }
      requestPending = true;

      try {
        const result = await getGmailSyncStatus(controller.signal);
        if (!active) return;

        const returnedStatus =
          typeof result?.sync_status === "string"
            ? result.sync_status
            : "unknown";
        const resolvedStatus =
          result?.sync_completed === true
            ? "completed"
            : returnedStatus;

        setGmailSyncStatus(resolvedStatus);
        setGmailSyncCheckError(false);

        if (resolvedStatus === "syncing") {
          gmailSyncWasActiveRef.current = true;
          timerId = window.setTimeout(checkGmailSyncStatus, 4000);
        } else if (
          resolvedStatus === "completed" ||
          resolvedStatus === "failed"
        ) {
          if (gmailSyncWasActiveRef.current) {
            gmailSyncWasActiveRef.current = false;
            setGmailSyncNotice(
              resolvedStatus === "completed" ? "ready" : "failed",
            );
            setIntegrationStatusVersion((version) => version + 1);

            if (resolvedStatus === "completed") {
              window.clearTimeout(gmailSyncNoticeTimerRef.current);
              gmailSyncNoticeTimerRef.current = window.setTimeout(
                () => setGmailSyncNotice(null),
                6000,
              );
            }
          }
        }
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) {
          refreshAuth();
        }
        setGmailSyncCheckError(true);
        if (gmailSyncWasActiveRef.current) {
          timerId = window.setTimeout(checkGmailSyncStatus, 4000);
        }
      } finally {
        requestPending = false;
      }
    };

    checkGmailSyncStatus();

    const checkWhenVisible = () => {
      if (document.visibilityState !== "visible" || !active) return;
      window.clearTimeout(timerId);
      checkGmailSyncStatus();
    };
    document.addEventListener("visibilitychange", checkWhenVisible);

    return () => {
      active = false;
      window.clearTimeout(timerId);
      controller.abort();
      document.removeEventListener("visibilitychange", checkWhenVisible);
    };
  }, [integrationStatus?.gmail, refreshAuth]);

  useEffect(
    () => () => window.clearTimeout(gmailSyncNoticeTimerRef.current),
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    if (user?.email) {
      getConversations(controller.signal)
        .then((result) => {
          if (!active) return;
          setConversations(Array.isArray(result) ? result : []);
          setSidebarError("");
        })
        .catch((error) => {
          if (!active || controller.signal.aborted) return;
          if (error instanceof ApiError && error.status === 401) {
            refreshAuth();
            return;
          }
          setSidebarError("Could not load recent chats.");
        });
    }

    return () => {
      active = false;
      controller.abort();
      sendControllerRef.current?.abort();
      historyControllerRef.current?.abort();
    };
  }, [refreshAuth, user?.email]);

  useEffect(() => {
    let active = true;
    let requestPending = false;
    const controller = new AbortController();

    const refreshIntegrationStatus = async () => {
      if (requestPending) return;
      requestPending = true;

      try {
        const result = await getIntegrationStatus(controller.signal);
        if (!active) return;

        setIntegrationStatus({
          gmail:
            typeof result?.gmail?.connected === "boolean"
              ? result.gmail.connected
              : null,
          calendar:
            typeof result?.calendar?.connected === "boolean"
              ? result.calendar.connected
              : null,
          github:
            typeof result?.github?.connected === "boolean"
              ? result.github.connected
              : null,
        });
        if (result?.gmail?.connected === false) {
          setGmailSyncStatus(null);
          setGmailSyncNotice(null);
          setGmailSyncCheckError(false);
          gmailSyncWasActiveRef.current = false;
        }
        setIntegrationStatusError(false);
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) {
          refreshAuth();
        }
        setIntegrationStatusError(true);
      } finally {
        requestPending = false;
        if (active) {
          setIsLoadingIntegrationStatus(false);
        }
      }
    };

    refreshIntegrationStatus();

    const refreshOnFocus = () => {
      if (document.visibilityState !== "visible" || !active) return;
      refreshIntegrationStatus();
    };
    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      active = false;
      controller.abort();
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [integrationStatusVersion, refreshAuth, user?.email]);

  useLayoutEffect(() => {
    const list = messageListRef.current;
    if (!list) return;

    if (!messages.length && !isLoadingHistory) {
      list.scrollTop = 0;
      return;
    }

    const pendingUserMessageId = pendingUserMessageRef.current;
    if (pendingUserMessageId) {
      const userMessage = Array.from(
        list.querySelectorAll("[data-message-id]"),
      ).find((element) => element.dataset.messageId === pendingUserMessageId);
      pendingUserMessageRef.current = null;

      if (userMessage) {
        const listTop = list.getBoundingClientRect().top;
        const messageTop = userMessage.getBoundingClientRect().top;
        list.scrollTop += messageTop - listTop - 56;
        shouldStickToBottomRef.current = false;
        scrollingToBottomRef.current = false;
      }
    }

    const distanceFromBottom =
      list.scrollHeight - list.scrollTop - list.clientHeight;
    if (shouldStickToBottomRef.current) {
      scrollingToBottomRef.current = false;
      list.scrollTop = list.scrollHeight;
      setShowScrollToBottom(false);
    } else {
      setShowScrollToBottom(distanceFromBottom > 120);
    }
  }, [isLoadingHistory, messages]);

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
    pendingUserMessageRef.current = null;
    scrollingToBottomRef.current = false;
    setShowScrollToBottom(false);
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
    pendingUserMessageRef.current = null;
    scrollingToBottomRef.current = false;
    setShowScrollToBottom(false);
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
    pendingUserMessageRef.current = userMessage.id;

    setDraft("");
    setSendError("");
    setConversationError("");
    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        isLoading: true,
        reservedHeight: messageListRef.current?.clientHeight ?? 0,
      },
    ]);
    setConversationTitle((current) =>
      current === "New chat" ? text.slice(0, 52) : current,
    );
    setIsSending(true);
    shouldStickToBottomRef.current = true;
    if (composerRef.current) composerRef.current.style.height = "auto";

    try {
      const result = await sendChatMessage(
        text,
        conversationId,
        controller.signal,
      );
      if (controller.signal.aborted) return;

      setConversationId(result.conversation_id);
      const responseContent = result.response?.content || "";
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: "",
                type: result.response?.type === "email" ? "email" : "text",
                data: result.response?.data ?? null,
                isLoading: false,
                isStreaming: true,
              }
            : message,
        ),
      );

      await revealAssistantResponse(
        responseContent,
        (content) =>
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId ? { ...message, content } : message,
            ),
          ),
        controller.signal,
      );
      if (controller.signal.aborted) return;

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? { ...message, isStreaming: false }
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
        message.isLoading || message.isStreaming
          ? {
              ...message,
              content: message.isLoading
                ? "Generation stopped."
                : message.content,
              isLoading: false,
              isStreaming: false,
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
  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");
  const showGmailIndexingNotice =
    gmailSyncStatus === "syncing" &&
    /\b(gmail|emails?|inbox|mail)\b/i.test(lastUserMessage?.content || "");

  return (
    <main className="chat-workspace flex h-[100dvh] min-w-0 overflow-hidden bg-[#080808] text-white">
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
                <span className="font-display text-lg tracking-tight">
                  NEURON
                </span>
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
            aria-label={
              isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
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

        <IntegrationsPanel
          collapsed={isSidebarCollapsed}
          status={integrationStatus}
          gmailSyncStatus={gmailSyncStatus}
          gmailSyncNotice={gmailSyncNotice}
          gmailSyncCheckError={gmailSyncCheckError}
          isLoading={isLoadingIntegrationStatus}
          hasError={integrationStatusError}
        />

        <section
          className={`mt-5 flex min-h-0 flex-1 flex-col px-3 ${
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
          <div className="chat-scrollbar min-h-0 flex-1 space-y-0.5 overflow-x-hidden overflow-y-auto overscroll-contain pr-1">
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
        <header className="chat-topbar flex h-[68px] shrink-0 items-center justify-between border-b border-white/[0.07] px-4 sm:px-6">
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

        <div className="relative min-h-0 flex-1">
          <div
            ref={messageListRef}
            onWheel={() => {
              scrollingToBottomRef.current = false;
            }}
            onTouchMove={() => {
              scrollingToBottomRef.current = false;
            }}
            onPointerDown={() => {
              scrollingToBottomRef.current = false;
            }}
            onScroll={(event) => {
              const element = event.currentTarget;
              if (!messages.length && !isLoadingHistory) {
                shouldStickToBottomRef.current = true;
                setShowScrollToBottom(false);
                return;
              }
              const distanceFromBottom =
                element.scrollHeight -
                element.scrollTop -
                element.clientHeight;
              const isNearBottom = distanceFromBottom < 120;

              if (scrollingToBottomRef.current) {
                if (isNearBottom) {
                  scrollingToBottomRef.current = false;
                  shouldStickToBottomRef.current = true;
                }
              } else {
                shouldStickToBottomRef.current = isNearBottom;
              }
              setShowScrollToBottom(!isNearBottom);
            }}
            className="chat-scrollbar h-full min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain [overflow-anchor:none]"
          >
            {isLoadingHistory ? (
              <div className="flex h-full items-center justify-center gap-2 text-sm text-white/40">
                <LoaderCircle className="size-4 animate-spin" />
                Loading conversation…
              </div>
            ) : messages.length ? (
              <div className="mx-auto w-full max-w-3xl min-w-0 px-5 pb-8 pt-6 sm:px-8">
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
          {showScrollToBottom && messages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const list = messageListRef.current;
                if (!list) return;
                shouldStickToBottomRef.current = true;
                scrollingToBottomRef.current = true;
                list.scrollTo({
                  top: list.scrollHeight,
                  behavior: "smooth",
                });
              }}
              aria-label="Scroll to latest message"
              title="Scroll to latest message"
              className="absolute bottom-4 right-5 z-10 flex size-10 items-center justify-center rounded-full border border-white/15 bg-[#1b1b1b] text-white/80 shadow-lg transition-colors hover:bg-[#292929] hover:text-white"
            >
              <ArrowDown className="size-4" />
            </button>
          )}
        </div>

        <div className="shrink-0 px-4 pb-3 pt-3 sm:px-6 sm:pb-5">
          <form onSubmit={sendMessage} className="mx-auto w-full max-w-3xl">
            {showGmailIndexingNotice && (
              <p
                role="status"
                className="mb-3 rounded-lg border border-blue-400/15 bg-blue-400/[0.05] px-3 py-2 text-xs text-blue-100/75"
              >
                Gmail context may not be fully indexed yet.
              </p>
            )}
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
            <div className="chat-composer rounded-[22px] border border-white/[0.1] bg-[#111318]/95 p-2 shadow-[0_14px_50px_rgba(0,0,0,0.32)] transition-colors focus-within:border-sky-100/20">
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
                className="max-h-48 min-h-12 w-full resize-none break-words bg-transparent px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/30 [overflow-wrap:anywhere]"
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
