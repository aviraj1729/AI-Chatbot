import { useState, useEffect, useRef } from "react";
import { ChatMessage as ChatMessageType } from "../types/chat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { ChatAPI } from "../services/api";
import { Bot, Moon, Sun } from "lucide-react";

interface ChatContainerProps {
  sessionId: string | null;
  onSessionCreated: (sessionId: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export function ChatContainer({
  sessionId,
  onSessionCreated,
  isDark,
  onToggleDark,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Change ref to point to the scrollable container, not a dummy div
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // 2. Use scrollTo on the container directly
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (sessionId) {
      loadSessionHistory();
    } else {
      setMessages([]);
    }
  }, [sessionId]);

  const loadSessionHistory = async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      const history = await ChatAPI.getSessionHistory(sessionId);
      setMessages(history.messages);
    } catch (error) {
      console.error("Failed to load session history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    // 1. Create a temporary message object to show immediately
    const tempId = Date.now().toString();
    const tempUserMessage: ChatMessageType = {
      id: tempId,
      role: "user",
      content: content,
      created_at: new Date().toISOString(),
      session_id: sessionId || "", // specific to your type definition
    };

    try {
      // 2. Add the temporary message to the UI immediately
      setMessages((prev) => [...prev, tempUserMessage]);
      setIsTyping(true);

      // 3. Send the request
      const response = await ChatAPI.sendMessage(
        content,
        sessionId || undefined,
      );

      // 4. Once response comes back:
      // - Replace the temporary user message with the real one from server (to get real ID/timestamp)
      // - Append the assistant's message
      setMessages((prev) =>
        prev
          .map((msg) => (msg.id === tempId ? response.user_message : msg))
          .concat(response.assistant_message),
      );

      if (!sessionId) {
        onSessionCreated(response.session_id);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
      // Optional: Remove the temp message if sending failed
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 min-h-0">
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                Chat with AI
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your intelligent assistant
              </p>
            </div>
          </div>
          <button
            onClick={onToggleDark}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* 3. Attach the ref to the scrollable div */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto px-6 py-6"
      >
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl mb-4">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                Start a Conversation
              </h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                Send a message to begin chatting with your AI assistant. Ask
                questions, get help, or just have a conversation!
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
            </>
          )}
          {/* Removed the messagesEndRef div since we scroll the container directly */}
        </div>
      </div>

      <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>
  );
}
