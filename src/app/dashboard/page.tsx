"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { MessageCircle, Plus, Search, Users, Bot, Clock, Star } from "lucide-react";
import Link from "next/link";

interface Character {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  creatorId: string;
  isPublic: boolean;
  avatar: string;
  createdAt: string;
  chatCount: number;
}

interface Chat {
  id: string;
  userId: string;
  characterId: string;
  characterName: string;
  characterAvatar: string;
  lastMessage: string;
  updatedAt: string;
  messageCount: number;
}

interface User {
  id: string;
  email: string;
  username: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [featuredCharacters, setFeaturedCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        router.push("/auth/login");
        return;
      }
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/auth/login");
    }
  };

  const loadDashboardData = async () => {
    try {
      const [charactersRes, chatsRes, featuredRes] = await Promise.all([
        fetch("/api/characters/my"),
        fetch("/api/chats/recent"),
        fetch("/api/characters/featured")
      ]);

      if (charactersRes.ok) {
        const characters = await charactersRes.json();
        setMyCharacters(characters);
      }

      if (chatsRes.ok) {
        const chats = await chatsRes.json();
        setRecentChats(chats);
      }

      if (featuredRes.ok) {
        const featured = await featuredRes.json();
        setFeaturedCharacters(featured);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCharacters = featuredCharacters.filter(character =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-muted-foreground">
            Continue your conversations or discover new AI characters
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Characters</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myCharacters.length}</div>
              <p className="text-xs text-muted-foreground">
                Characters you've created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentChats.length}</div>
              <p className="text-xs text-muted-foreground">
                Ongoing conversations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentChats.reduce((sum, chat) => sum + chat.messageCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Messages exchanged
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="chats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chats">Recent Chats</TabsTrigger>
            <TabsTrigger value="characters">My Characters</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>

          <TabsContent value="chats" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Conversations</h2>
              <Button asChild>
                <Link href="/characters">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Start New Chat
                </Link>
              </Button>
            </div>

            {recentChats.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start chatting with AI characters to see your conversations here
                  </p>
                  <Button asChild>
                    <Link href="/characters">Browse Characters</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {recentChats.map((chat) => (
                  <Card key={chat.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <Link href={`/chat/${chat.id}`}>
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={chat.characterAvatar} />
                            <AvatarFallback>
                              {chat.characterName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium truncate">{chat.characterName}</h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="mr-1 h-3 w-3" />
                                {new Date(chat.updatedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {chat.lastMessage}
                            </p>
                            <div className="flex items-center mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {chat.messageCount} messages
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="characters" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Characters</h2>
              <Button asChild>
                <Link href="/characters/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Character
                </Link>
              </Button>
            </div>

            {myCharacters.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No characters created yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first AI character with a custom personality
                  </p>
                  <Button asChild>
                    <Link href="/characters/create">Create Character</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myCharacters.map((character) => (
                  <Card key={character.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={character.avatar} />
                          <AvatarFallback>
                            {character.name?.charAt(0)?.toUpperCase() || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{character.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant={character.isPublic ? "default" : "secondary"}>
                              {character.isPublic ? "Public" : "Private"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="line-clamp-2 mb-3">
                        {character.description}
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MessageCircle className="mr-1 h-3 w-3" />
                          {character.chatCount} chats
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/characters/${character.id}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Discover Characters</h2>
              <Button variant="outline" asChild>
                <Link href="/characters">View All</Link>
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search characters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCharacters.slice(0, 6).map((character) => (
                <Card key={character.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={character.avatar} />
                        <AvatarFallback>
                          {character.name?.charAt(0)?.toUpperCase() || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{character.name}</CardTitle>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-muted-foreground">Featured</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="line-clamp-2 mb-3">
                      {character.description}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MessageCircle className="mr-1 h-3 w-3" />
                        {character.chatCount} chats
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/characters/${character.id}`}>
                          Chat Now
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCharacters.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No characters found</h3>
                  <p className="text-muted-foreground text-center">
                    Try adjusting your search terms or browse all characters
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}