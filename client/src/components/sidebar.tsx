import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import { MessageSquare, Plus, Settings } from "lucide-react"

export function Sidebar() {
  return (
    <div className="w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="p-4">
          <Button className="w-full justify-start" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat 1
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat 2
            </Button>
          </div>
        </ScrollArea>
        <div className="p-4 flex items-center justify-between">
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}

