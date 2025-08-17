"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, User, Calendar, Eye } from "lucide-react"
import { Character } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface CharacterCardProps {
  character: Character
  showCreator?: boolean
  showActions?: boolean
  onChat?: (characterId: string) => void
  onEdit?: (characterId: string) => void
  onDelete?: (characterId: string) => void
}

export function CharacterCard({
  character,
  showCreator = true,
  showActions = false,
  onChat,
  onEdit,
  onDelete
}: CharacterCardProps) {
  const handleChatClick = () => {
    if (onChat) {
      onChat(character.id)
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onEdit) {
      onEdit(character.id)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete) {
      onDelete(character.id)
    }
  }

  const getInitials = (name: string | undefined) => {
    if (!name) return 'CH';
    return name
      .split(' ')
      .map(word => word?.[0] || '')
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'CH'
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-border/50 hover:border-border">
      <Link href={`/characters/${character.id}`} className="block">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 border-2 border-border/20">
              <AvatarImage 
                src={character.avatar} 
                alt={character.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(character.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                  {character.name}
                </CardTitle>
                {!character.isPublic && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>
              {showCreator && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <User className="h-3 w-3" />
                  <span className="truncate">by {character.creatorUsername || 'Unknown'}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <CardDescription className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {character.description}
          </CardDescription>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{character.chatCount || 0} chats</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(character.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={handleChatClick}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
            
            {showActions && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleEditClick}
                >
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={handleDeleteClick}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}