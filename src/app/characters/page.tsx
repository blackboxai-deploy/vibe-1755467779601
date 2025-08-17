'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, MessageCircle, Users, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const categories = ['all', 'assistant', 'creative', 'educational', 'entertainment', 'roleplay', 'other']

  useEffect(() => {
    fetchCharacters()
  }, [])

  useEffect(() => {
    filterCharacters()
  }, [characters, searchTerm, selectedCategory])

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters')
      if (!response.ok) {
        throw new Error('Failed to fetch characters')
      }
      const data = await response.json()
      setCharacters(data.characters || [])
    } catch (err) {
      setError('Failed to load characters')
      console.error('Error fetching characters:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterCharacters = () => {
    let filtered = characters.filter(char => char.isPublic)

    if (searchTerm) {
      filtered = filtered.filter(char =>
        char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.creatorName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(char => char.category === selectedCategory)
    }

    // Sort by chat count (popularity) and creation date
    filtered.sort((a, b) => {
      if (b.chatCount !== a.chatCount) {
        return b.chatCount - a.chatCount
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    setFilteredCharacters(filtered)
  }

  const startChat = (characterId: string) => {
    router.push(`/chat/${characterId}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Characters</h1>
          <p className="text-muted-foreground">
            Discover and chat with AI characters created by the community
          </p>
        </div>
        <Link href="/characters/create">
          <Button className="mt-4 md:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Create Character
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search characters, descriptions, or creators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchCharacters} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Characters Grid */}
      {!error && (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              {filteredCharacters.length} character{filteredCharacters.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {filteredCharacters.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No characters found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to create a character!'}
              </p>
              <Link href="/characters/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Character
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCharacters.map((character) => (
                <Card key={character.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={character.avatar} alt={character.name} />
                        <AvatarFallback>
                          {character.name?.split(' ').map(n => n?.[0] || '').join('').toUpperCase() || 'CH'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{character.name}</CardTitle>
                        <CardDescription className="text-sm">
                          by {character.creatorName}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {character.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="capitalize">
                        {character.category}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-1" />
                        {character.chatCount}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => startChat(character.id)}
                        className="flex-1"
                        size="sm"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                      <Link href={`/characters/${character.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}