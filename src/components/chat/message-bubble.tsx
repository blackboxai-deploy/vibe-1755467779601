import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"

interface MessageBubbleProps {
  message: {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }
  character?: {
    name: string
    avatar: string
  }
  isTyping?: boolean
}

export function MessageBubble({ message, character, isTyping = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  
  return (
    <div className={cn(
      "flex gap-3 max-w-[80%] mb-4",
      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        {isUser ? (
          <>
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src={character?.avatar} alt={character?.name} />
            <AvatarFallback>
              <Bot className="w-4 h-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>
      
      <div className={cn(
        "flex flex-col gap-1",
        isUser ? "items-end" : "items-start"
      )}>
        <Card className={cn(
          "px-4 py-2 max-w-full break-words",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted",
          isTyping && "animate-pulse"
        )}>
          <div className="text-sm whitespace-pre-wrap">
            {isTyping ? (
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              message.content
            )}
          </div>
        </Card>
        
        <div className={cn(
          "text-xs text-muted-foreground px-1",
          isUser ? "text-right" : "text-left"
        )}>
          {!isTyping && new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  )
}