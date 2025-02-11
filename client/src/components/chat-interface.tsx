'use client'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send } from "lucide-react"

type Message = {
  id: string
  userContent: string
  botContent?: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  function generateIdFromDate() {
    const timestamp = Date.now(); // Get current timestamp (milliseconds since Jan 1, 1970)
    const randomSuffix = Math.floor(Math.random() * 1000); // Random number to ensure uniqueness
    return `${timestamp}-${randomSuffix}`;
  }

  // Function to handle sending user message and fetching assistant response
  const handleSend = async () => {
    const id = generateIdFromDate()
    if (input.trim()) {
      // Add user's message to the messages state
      setMessages([...messages, { id: id, userContent: input }])

      // Clear input field after sending
      setInput("")

      try {
        const response = await fetch('/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input }),
        })

        if (response.body) {
          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let done = false
          let content = ""

          // Read the response stream and update chat as it arrives
          while (!done) {
            const { value, done: isDone } = await reader.read()
            done = isDone

            // Decode the chunk
            const temp = decoder.decode(value, { stream: true })

            try {
              // Append new content to the message
              content += temp

              // Update the message in the chat with the new content
              setMessages(prevMessages =>
                prevMessages.map(message =>
                  message.id === id
                    ? { ...message, botContent: content }  // Update the message with the new content
                    : message
                )
              );
            } catch (error) {
              console.error('Error reading stream:', error)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching from chatbot API:", error)
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {messages.map((message, index) => (
          <div key={index}>

            <div className={`flex justify-end mb-4`}>
              <div className={`flex items-start flex-row-reverse`}>
                <Avatar className="w-8 h-8">
                  <AvatarFallback> U</AvatarFallback>
                </Avatar>
                <div className={`mx-2 p-3 rounded-lg bg-primary text-primary-foreground`}>
                  {message.userContent}
                </div>
              </div>
            </div>
            {
              message.botContent && (
                <div key={index} className={`flex justify-start mb-4`}>
                  <div className={`flex items-start flex-row`}>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className={`mx-2 p-3 rounded-lg bg-muted`}>
                      {message.botContent}
                    </div>
                  </div>
                </div>
              )
            }

          </div>

        ))}
      </ScrollArea>
      <div className="p-4 border-t">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            await handleSend()
          }}
          className="flex space-x-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
