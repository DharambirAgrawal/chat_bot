'use client'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Bot, User } from "lucide-react"
import CompilePreviewMDX from "./CompileMDX"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  userContent: string
  botContent?: {
    think?: string
    content?: string
  }
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  function generateIdFromDate() {
    const timestamp = Date.now()
    const randomSuffix = Math.floor(Math.random() * 1000)
    return `${timestamp}-${randomSuffix}`
  }

  const processContent = (content: string) => {
    let thinkContent = ''
    let remainingContent = content
    
    const thinkStartIndex = content.indexOf('<think>')
    const thinkEndIndex = content.indexOf('</think>')
  
    if (thinkStartIndex !== -1 && thinkEndIndex === -1) {
      thinkContent = content.slice(thinkStartIndex)
      remainingContent = content.slice(0, thinkStartIndex)
    } else if (thinkStartIndex !== -1 && thinkEndIndex !== -1) {
      thinkContent = content.slice(thinkStartIndex, thinkEndIndex + '</think>'.length)
      remainingContent = content.slice(0, thinkStartIndex) + content.slice(thinkEndIndex + '</think>'.length)
    }
  
    return { thinkContent, remainingContent }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    const id = generateIdFromDate()
    setMessages(prev => [...prev, { id, userContent: input }])
    setInput("")
    console.log(messages)

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messages, input:input }),
      })

      if (response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let done = false
        let content = ""

        while (!done) {
          const { value, done: isDone } = await reader.read()
          done = isDone
          const temp = decoder.decode(value, { stream: true })
          content += temp

          const { thinkContent, remainingContent } = processContent(content)

          setMessages(prevMessages =>
            prevMessages.map(message =>
              message.id === id
                ? { ...message, botContent: { think: thinkContent } }
                : message
            )
          )

          if (thinkContent && thinkContent.includes('</think>')) {
            setMessages(prevMessages =>
              prevMessages.map(message =>
                message.id === id
                  ? { 
                      ...message, 
                      botContent: {
                        think: message.botContent?.think,
                        content: remainingContent
                      } 
                    }
                  : message
              )
            )
          }
        }
      }
    } catch (error) {
      console.error("Error fetching from chatbot API:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div key={index} className="space-y-4">
              <div className="flex justify-end">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="rounded-2xl bg-primary px-4 py-2 text-primary-foreground">
                    <p className="text-sm">{message.userContent}</p>
                  </div>
                  <Avatar className="h-8 w-8 border-2 border-muted">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {message.botContent && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <Avatar className="h-8 w-8 border-2 border-muted">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      {message.botContent.think && (
                        <div className="rounded-2xl bg-muted/50 px-4 py-2">
                          <p className="text-sm text-muted-foreground italic">
                            {message.botContent.think}
                          </p>
                        </div>
                      )}
                      {message.botContent.content && (
                        <div className="rounded-2xl bg-muted px-4 py-2">
                          <article className="prose prose-sm dark:prose-invert">
                            <CompilePreviewMDX content={message.botContent.content} />
                          </article>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t bg-background p-4">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            await handleSend()
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || !input.trim()}
            className={cn(
              "transition-all duration-200",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  )
}