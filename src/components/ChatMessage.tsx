import { ChatMessage as ChatMessageType } from "../types/chat";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      } mb-4 animate-fade-in`}
    >
      {/* Avatar Circle */}
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

      {/* Message Bubble */}
      <div
        className={`flex flex-col max-w-[85%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm overflow-hidden ${
            isUser
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm"
              : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-sm"
          }`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              // Override default elements to match Tailwind styling
              p: ({ children }) => (
                <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
              ),
              li: ({ children }) => <li className="pl-1">{children}</li>,
              h1: ({ children }) => (
                <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-bold mt-2 mb-1">{children}</h3>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-2 italic opacity-80">
                  {children}
                </blockquote>
              ),
              // Code Block Styling
              pre: ({ children }) => (
                <pre className="bg-slate-950 text-slate-50 p-3 rounded-lg overflow-x-auto my-2 text-sm shadow-inner">
                  {children}
                </pre>
              ),
              // Inline Code Styling
              code: ({ className, children, ...props }: any) => {
                // Determine if it's inline or block based on parent (simplified heuristic)
                // In this structure, `pre` handles the block container, so we just style the text.
                // However, inline `code` won't be wrapped in `pre`.
                // We apply a background only if it's NOT inside a pre (which is handled by the pre component above)
                const isInline = !className;
                return (
                  <code
                    className={`${
                      isInline
                        ? "bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 font-mono text-[0.9em]"
                        : "font-mono text-sm"
                    }`}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
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
