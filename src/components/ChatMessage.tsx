import { ChatMessage as ChatMessageType } from "../types/chat";
import { Bot, User } from "lucide-react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  /**
   * Renders text with:
   * - **bold**
   * - inline math: $a^2$
   * - block math: $$a^2 + b^2 = c^2$$
   */
  const renderMessageContent = (text: string) => {
    const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$]+\$|\*\*[^*]+\*\*)/g);

    return parts.map((part, i) => {
      // Block math $$...$$
      if (part.startsWith("$$") && part.endsWith("$$")) {
        return <BlockMath key={i}>{part.slice(2, -2)}</BlockMath>;
      }

      // Inline math $...$
      if (part.startsWith("$") && part.endsWith("$")) {
        return <InlineMath key={i}>{part.slice(1, -1)}</InlineMath>;
      }

      // Bold **text**
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }

      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div
      className={`flex gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      } mb-4 animate-fade-in`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-blue-600"
            : "bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700"
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      <div
        className={`flex flex-col max-w-[75%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            isUser
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm"
              : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-sm"
          }`}
        >
          <div className="whitespace-pre-wrap break-words">
            {renderMessageContent(message.content)}
          </div>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-1">
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
