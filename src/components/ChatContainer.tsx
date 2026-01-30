import { useState, useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType } from '../types/chat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { ChatAPI } from '../services/api';
import { Bot, Moon, Sun } from 'lucide-react';

interface ChatContainerProps {
  sessionId: string | null;
  onSessionCreated: (sessionId: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export function ChatContainer({ sessionId, onSessionCreated, isDark, onToggleDark }: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      console.error('Failed to load session history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      setIsTyping(true);

      const response = await ChatAPI.sendMessage(content, sessionId || undefined);

      setMessages((prev) => [
        ...prev,
        response.user_message,
        response.assistant_message,
      ]);

      if (!sessionId) {
        onSessionCreated(response.session_id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900">
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

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl mb-4">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                Start a Conversation
              </h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                Send a message to begin chatting with your AI assistant. Ask questions, get help, or just have a conversation!
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
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>
  );
}
