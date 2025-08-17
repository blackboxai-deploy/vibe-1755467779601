'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { User, Settings, Trash2, Edit, MessageSquare, Users, Calendar, Eye, EyeOff } from 'lucide-react'

interface User {
  id: string
  email: string
  username: string
  bio?: string
  avatar?: string
  createdAt: string
}

interface Character {
  id: string
  name: string
  description: string
  systemPrompt: string
  creatorId: string
  isPublic: boolean
  avatar: string
  createdAt: string
  chatCount: number
}

interface Chat {
  id: string
  userId: string
  characterId: string
  characterName: string
  lastMessage: string
  updatedAt: string
  messageCount: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    bio: ''
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const [userRes, charactersRes, chatsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/characters/my'),
        fetch('/api/chats/my')
      ])

      if (!userRes.ok) {
        router.push('/auth/login')
        return
      }

      const userData = await userRes.json()
      const charactersData = charactersRes.ok ? await charactersRes.json() : []
      const chatsData = chatsRes.ok ? await chatsRes.json() : []

      setUser(userData)
      setCharacters(charactersData)
      setChats(chatsData)
      setProfileForm({
        username: userData.username,
        email: userData.email,
        bio: userData.bio || ''
      })
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        setEditingProfile(false)
        toast.success('Profile updated successfully')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleCharacterVisibilityToggle = async (characterId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPublic: !isPublic })
      })

      if (response.ok) {
        setCharacters(characters.map(char => 
          char.id === characterId ? { ...char, isPublic: !isPublic } : char
        ))
        toast.success(`Character ${!isPublic ? 'published' : 'made private'}`)
      } else {
        toast.error('Failed to update character visibility')
      }
    } catch (error) {
      console.error('Error updating character:', error)
      toast.error('Failed to update character')
    }
  }

  const handleCharacterDelete = async (characterId: string) => {
    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCharacters(characters.filter(char => char.id !== characterId))
        toast.success('Character deleted successfully')
      } else {
        toast.error('Failed to delete character')
      }
    } catch (error) {
      console.error('Error deleting character:', error)
      toast.error('Failed to delete character')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{user.username}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              {user.bio && (
                <p className="text-sm text-muted-foreground mt-2">{user.bio}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{characters.length}</div>
                  <div className="text-sm text-muted-foreground">Characters</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{chats.length}</div>
                  <div className="text-sm text-muted-foreground">Chats</div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setEditingProfile(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="characters" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="characters" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                My Characters
              </TabsTrigger>
              <TabsTrigger value="chats" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="characters" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Your Characters</h3>
                <Button onClick={() => router.push('/characters/create')}>
                  Create Character
                </Button>
              </div>
              
              {characters.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No characters yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first AI character to get started
                    </p>
                    <Button onClick={() => router.push('/characters/create')}>
                      Create Character
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {characters.map((character) => (
                    <Card key={character.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={character.avatar} />
                              <AvatarFallback>
                                {character.name?.charAt(0)?.toUpperCase() || 'C'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold truncate">{character.name}</h4>
                                <Badge variant={character.isPublic ? "default" : "secondary"}>
                                  {character.isPublic ? "Public" : "Private"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {character.description}
                              </p>
                              <div className="flex items-center text-xs text-muted-foreground space-x-4">
                                <span>{character.chatCount} chats</span>
                                <span>Created {new Date(character.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCharacterVisibilityToggle(character.id, character.isPublic)}
                            >
                              {character.isPublic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/characters/${character.id}/edit`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Character</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{character.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCharacterDelete(character.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="chats" className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Conversations</h3>
              
              {chats.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start chatting with AI characters to see your history here
                    </p>
                    <Button onClick={() => router.push('/characters')}>
                      Browse Characters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {chats.map((chat) => (
                    <Card key={chat.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent 
                        className="p-4"
                        onClick={() => router.push(`/chat/${chat.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold mb-1">{chat.characterName}</h4>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {chat.lastMessage}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground space-x-4">
                              <span>{chat.messageCount} messages</span>
                              <span>Last active {new Date(chat.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      {editingProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingProfile(false)}>
                  Cancel
                </Button>
                <Button onClick={handleProfileUpdate}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}