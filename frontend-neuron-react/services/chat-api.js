import { apiRequest } from "@/lib/api-client";

/**
 * @typedef {{ message_id: string, thread_id: string, content: string, subject: string, sender: string, recipient: string, date: string, distance: number }} EmailResult
 * @typedef {{ type: "text", content: string, data: null }} TextResponse
 * @typedef {{ type: "email", content: string, data: { emails: EmailResult[] } }} EmailResponse
 * @typedef {{ conversation_id: number, message: string, response: TextResponse | EmailResponse }} ChatResponse
 * @typedef {{ id: number, title: string | null, created_at: string }} ConversationSummary
 * @typedef {{ id: number, role: string, content: string, created_at: string }} ConversationMessage
 * @typedef {{ conversation_id: number, messages: ConversationMessage[] }} ConversationHistory
 */

/**
 * @param {string} message
 * @param {number | null} conversationId
 * @param {AbortSignal} [signal]
 * @returns {Promise<ChatResponse>}
 */
export function sendChatMessage(message, conversationId = null, signal) {
  return apiRequest("/api/v1/chat", {
    method: "POST",
    body: { message, conversation_id: conversationId },
    signal,
  });
}

/** @returns {Promise<ConversationSummary[]>} */
export function getConversations() {
  return apiRequest("/api/v1/conversations");
}

/**
 * @param {number} conversationId
 * @param {AbortSignal} [signal]
 * @returns {Promise<ConversationHistory>}
 */
export function getConversation(conversationId, signal) {
  return apiRequest(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}`,
    { signal },
  );
}
