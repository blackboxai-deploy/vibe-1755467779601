"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, Search, Filter, Users, Clock } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface Character {
  id: string
  name: string
  description: string
  systemPrompt: string
  creatorId: string
  creatorName: string
  isPublic: boolean
  avatar: string
  createdAt: string
  chatCount: number
  category: string
  tags: string[]
}

interface CharacterGalleryProps {
  showMyCharacters?: boolean
  userId?: string
}

export function CharacterGallery({ showMyCharacters = false, userId }: CharacterGalleryProps) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    fetchCharacters()
  }, [showMyCharacters, userId])

  useEffect(() => {
    filterAndSortCharacters()
  }, [characters, searchQuery, sortBy, categoryFilter])

  const fetchCharacters = async () => {
    try {
      setLoading(true)
      const url = showMyCharacters && userId 
        ? `/api/characters?userId=${userId}` 
        : '/api/characters?public=true'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setCharacters(data.characters || [])
      }
    } catch (error) {
      console.error('Failed to fetch characters:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortCharacters = () => {
    let filtered = [...characters]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(character =>
        character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        character.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        character.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(character => character.category === categoryFilter)
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "popular":
        filtered.sort((a, b) => b.chatCount - a.chatCount)
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    setFilteredCharacters(filtered)
  }

  const getUniqueCategories = () => {
    const categories = characters.map(char => char.category).filter(Boolean)
    return [...new Set(categories)]
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-3 bg-muted rounded w-16" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </CardContent>
            <CardFooter>
              <div className="h-8 bg-muted rounded w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {getUniqueCategories().map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredCharacters.length} character{filteredCharacters.length !== 1 ? 's' : ''} found
      </div>

      {/* Character Grid */}
      {filteredCharacters.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {searchQuery || categoryFilter !== "all" 
              ? "No characters match your filters" 
              : showMyCharacters 
                ? "You haven't created any characters yet" 
                : "No public characters available"
            }
          </div>
          {showMyCharacters && (
            <Button asChild>
              <Link href="/characters/create">Create Your First Character</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCharacters.map((character) => (
            <Card key={character.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={character.avatar} alt={character.name} />
                      <AvatarFallback>
                        {character.name?.split(' ').map(n => n?.[0] || '').join('').toUpperCase() || 'CH'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg leading-tight">{character.name}</CardTitle>
                      <CardDescription className="text-xs">
                        by {character.creatorName}
                      </CardDescription>
                    </div>
                  </div>
                  {character.category && (
                    <Badge variant="secondary" className="text-xs">
                      {character.category}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {character.description}
                </p>
                
                {character.tags && character.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {character.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {character.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{character.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{character.chatCount} chats</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(character.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-3">
                <div className="flex gap-2 w-full">
                  <Button asChild className="flex-1">
                    <Link href={`/characters/${character.id}`}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/characters/${character.id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}