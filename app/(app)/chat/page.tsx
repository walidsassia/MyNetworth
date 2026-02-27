"use client"

import { useChat } from "ai/react"
import { SendHorizontal, Bot, User, Loader2 } from "lucide-react"
import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({ api: "/api/chat" })
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-2xl font-semibold text-foreground text-balance">AI Assistant</h1>
        <p className="text-sm text-muted-foreground mt-1">Ask questions about your finances and get personalized advice</p>
      </div>

      <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Your financial AI assistant</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Ask me anything about your net worth, spending habits, or how to improve your financial health.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "How is my net worth trending?",
                  "Where am I spending the most?",
                  "How can I reduce my debt?",
                  "What's my savings rate?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      const syntheticEvent = {
                        target: { value: suggestion },
                      } as React.ChangeEvent<HTMLInputElement>
                      handleInputChange(syntheticEvent)
                    }}
                    className="px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-3xl",
                message.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                message.role === "user" ? "bg-primary" : "bg-secondary"
              )}>
                {message.role === "user"
                  ? <User className="w-3.5 h-3.5 text-primary-foreground" />
                  : <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                }
              </div>
              <div className={cn(
                "px-4 py-2.5 rounded-xl text-sm leading-relaxed",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              )}>
                {message.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-secondary flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-3">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about your finances..."
              className="flex-1 px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors flex-shrink-0"
              aria-label="Send message"
            >
              <SendHorizontal className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
