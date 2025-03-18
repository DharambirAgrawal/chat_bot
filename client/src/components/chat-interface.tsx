// 'use client'
// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Send, Bot, User } from "lucide-react"
// import CompilePreviewMDX from "./CompileMDX"
// import { cn } from "@/lib/utils"

// type Message = {
//   id: string
//   userContent: string
//   botContent?: {
//     think?: string
//     content?: string
//   }
//   isThinking?: boolean
//   showThinking?: boolean // This will control the toggle state for showing the thinking message
// }

// export function ChatInterface() {
//   const [messages, setMessages] = useState<Message[]>([])
//   const [input, setInput] = useState("")
//   const [isLoading, setIsLoading] = useState(false)

//   function generateIdFromDate() {
//     const timestamp = Date.now()
//     const randomSuffix = Math.floor(Math.random() * 1000)
//     return `${timestamp}-${randomSuffix}`
//   }

//   const processContent = (content: string) => {
//     let thinkContent = ''
//     let remainingContent = content
    
//     const thinkStartIndex = content.indexOf('<think>')
//     const thinkEndIndex = content.indexOf('</think>')
  
//     if (thinkStartIndex !== -1 && thinkEndIndex === -1) {
//       thinkContent = content.slice(thinkStartIndex)
//       remainingContent = content.slice(0, thinkStartIndex)
//     } else if (thinkStartIndex !== -1 && thinkEndIndex !== -1) {
//       thinkContent = content.slice(thinkStartIndex, thinkEndIndex + '</think>'.length)
//       remainingContent = content.slice(0, thinkStartIndex) + content.slice(thinkEndIndex + '</think>'.length)
//     }
  
//     return { thinkContent, remainingContent }
//   }

//   const handleSend = async () => {
//     if (!input.trim()) return

//     setIsLoading(true)
//     const id = generateIdFromDate()
//     setMessages(prev => [...prev, { id, userContent: input }])
//     setInput("")

//     try {
//       const response = await fetch('/api', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message: messages, input: input }),
//       })

//       if (response.body) {
//         const reader = response.body.getReader()
//         const decoder = new TextDecoder()
//         let done = false
//         let content = ""

//         while (!done) {
//           const { value, done: isDone } = await reader.read()
//           done = isDone
//           const temp = decoder.decode(value, { stream: true })
//           content += temp

//           const { thinkContent, remainingContent } = processContent(content)

//           // Update thinking content for the specific message
//           setMessages(prevMessages =>
//             prevMessages.map(message =>
//               message.id === id
//                 ? { ...message, botContent: { think: thinkContent }, isThinking: true, showThinking: true } // Show thinking initially
//                 : message
//             )
//           )

//           if (thinkContent && thinkContent.includes('</think>')) {
//             setMessages(prevMessages =>
//               prevMessages.map(message =>
//                 message.id === id
//                   ? { 
//                       ...message, 
//                       botContent: { think: message.botContent?.think, content: remainingContent }, 
//                       isThinking: false 
//                     }
//                   : message
//               )
//             )
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching from chatbot API:", error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="flex flex-col h-full bg-background">
//       <ScrollArea className="flex-1 p-4">
//         <div className="space-y-6">
//           {messages.map((message, index) => (
//             <div key={index} className="space-y-4">
//               <div className="flex justify-end">
//                 <div className="flex items-start gap-2 max-w-[80%]">
//                   <div className="rounded-2xl bg-primary px-4 py-2 text-primary-foreground">
//                     <p className="text-sm">{message.userContent}</p>
//                   </div>
//                   <Avatar className="h-8 w-8 border-2 border-muted">
//                     <AvatarFallback className="bg-secondary text-secondary-foreground">
//                       <User className="h-4 w-4" />
//                     </AvatarFallback>
//                   </Avatar>
//                 </div>
//               </div>

//               {message.botContent && (
//                 <div className="flex justify-start">
//                   <div className="flex items-start gap-2 max-w-[80%]">
//                     <Avatar className="h-8 w-8 border-2 border-muted">
//                       <AvatarFallback className="bg-secondary text-secondary-foreground">
//                         <Bot className="h-4 w-4" />
//                       </AvatarFallback>
//                     </Avatar>
//                     <div className="space-y-2">
//                       {message.isThinking && message.botContent.think && message.showThinking && (
//                         <div
//                           className="rounded-2xl bg-muted/50 px-4 py-2 cursor-pointer"
//                           onClick={() => setMessages(prevMessages =>
//                             prevMessages.map(msg =>
//                               msg.id === message.id
//                                 ? { ...msg, showThinking: !msg.showThinking }
//                                 : msg
//                             )
//                           )}
//                         >
//                           <span className="p-2 m-1 animate-pulse">Thinking...</span>
//                         </div>
//                       )}
//                       {message.botContent.content && (
//                         <div className="rounded-2xl bg-muted px-4 py-2">
//                           <article className="prose prose-sm dark:prose-invert">
//                             <CompilePreviewMDX content={message.botContent.content} />
//                           </article>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </ScrollArea>

//       <div className="border-t bg-background p-4">
//         <form
//           onSubmit={async (e) => {
//             e.preventDefault()
//             await handleSend()
//           }}
//           className="flex items-center gap-2"
//         >
//           <Input
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder="Type your message..."
//             className="flex-1"
//             disabled={isLoading}
//           />
//           <Button
//             type="submit"
//             size="icon"
//             disabled={isLoading || !input.trim()}
//             className={cn(
//               "transition-all duration-200",
//               isLoading && "opacity-50 cursor-not-allowed"
//             )}
//           >
//             <Send className="h-4 w-4" />
//             <span className="sr-only">Send message</span>
//           </Button>
//         </form>
//       </div>
//     </div>
//   )
// }
'use client'
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Bot, User, ThumbsUp, ThumbsDown, Sparkles, CornerDownLeft } from "lucide-react"
import CompilePreviewMDX from "./CompileMDX"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Message = {
  id: string
  userContent: string
  botContent?: {
    think?: string
    content?: string
  }
  isThinking?: boolean
  showThinking?: boolean
  timestamp: Date
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

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
    setMessages(prev => [...prev, { id, userContent: input, timestamp: new Date() }])
    setInput("")

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messages, input: input }),
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

          // Update thinking content for the specific message
          setMessages(prevMessages =>
            prevMessages.map(message =>
              message.id === id
                ? { ...message, botContent: { think: thinkContent }, isThinking: true, showThinking: true }
                : message
            )
          )

          if (thinkContent && thinkContent.includes('</think>')) {
            setMessages(prevMessages =>
              prevMessages.map(message =>
                message.id === id
                  ? { 
                      ...message, 
                      botContent: { think: message.botContent?.think, content: remainingContent }, 
                      isThinking: false 
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
      // Focus input after sending
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg shadow-sm overflow-hidden">
      <div className="border-b p-4 flex items-center justify-between bg-background">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border-2 border-primary">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-sm">AI Assistant</h2>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Sparkles className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Advanced Features</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Bot className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">How can I help you today?</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                Ask me anything, from writing code to answering questions about a wide range of topics.
              </p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={index} className="space-y-4">
              <div className="flex justify-end">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="flex flex-col">
                    <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2 text-primary-foreground">
                      <p className="text-sm">{message.userContent}</p>
                    </div>
                    <span className="text-xs text-muted-foreground self-end mt-1 mr-1">
                      {formatTime(message.timestamp)}
                    </span>
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
                      {message.isThinking && message.botContent.think && message.showThinking && (
                        <div
                          className="rounded-2xl bg-muted/30 px-4 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setMessages(prevMessages =>
                            prevMessages.map(msg =>
                              msg.id === message.id
                                ? { ...msg, showThinking: !msg.showThinking }
                                : msg
                            )
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-2 w-2 bg-primary rounded-full animate-pulse"></span>
                            <span className="text-xs font-medium text-muted-foreground">Thinking...</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 italic">
                            Click to toggle thinking process
                          </div>
                        </div>
                      )}
                      {message.botContent.content && (
                        <div className="flex flex-col">
                          <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2">
                            <article className="prose prose-sm dark:prose-invert">
                              <CompilePreviewMDX content={message.botContent.content} />
                            </article>
                          </div>
                          <div className="flex items-center gap-2 mt-1 ml-1">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(new Date(message.timestamp.getTime() + 1000))}
                            </span>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <ThumbsUp className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <ThumbsDown className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                              </Button>
                            </div>
                          </div>
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
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 py-2 px-4 bg-muted/50 focus:bg-background border-muted"
            disabled={isLoading}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "transition-all duration-200 bg-primary hover:bg-primary/90",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CornerDownLeft className="h-4 w-4" />
                  )}
                  <span className="sr-only">Send message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Send message</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </form>
      </div>
    </div>
  )
}