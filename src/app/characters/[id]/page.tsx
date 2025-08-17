'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, User, Calendar, Eye, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Character {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  creatorId: string;
  creatorName?: string;
  isPublic: boolean;
  avatar: string;
  createdAt: string;
  chatCount: number;
  category?: string;
}

interface User {
  id: string;
  username: string;
}

export default function CharacterPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [character, setCharacter] = useState<Character | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    fetchCharacter();
    fetchCurrentUser();
  }, [params.id]);

  const fetchCharacter = async () => {
    try {
      const response = await fetch(`/api/characters/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setCharacter(data);
      } else {
        toast({
          title: "Error",
          description: "Character not found",
          variant: "destructive",
        });
        router.push('/characters');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load character",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  };

  const startChat = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to start chatting",
        variant: "destructive",
      });
      router.push('/auth/login');
      return;
    }

    setStartingChat(true);
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId: character?.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/chat/${data.chatId}`);
      } else {
        toast({
          title: "Error",
          description: "Failed to start chat",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start chat",
        variant: "destructive",
      });
    } finally {
      setStartingChat(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Character Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The character you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/characters')}>
            Browse Characters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Character Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={character.avatar} alt={character.name} />
                <AvatarFallback className="text-2xl">
                  {character.name?.charAt(0)?.toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-3xl">{character.name}</CardTitle>
                  {character.category && (
                    <Badge variant="secondary">{character.category}</Badge>
                  )}
                </div>
                
                <CardDescription className="text-lg mb-4">
                  {character.description}
                </CardDescription>
                
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Created by {character.creatorName || 'Unknown'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(character.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {character.chatCount} chats
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex justify-center">
              <Button
                onClick={startChat}
                disabled={startingChat}
                size="lg"
                className="px-8"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {startingChat ? 'Starting Chat...' : 'Start Chatting'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Character Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personality Section */}
            <Card>
              <CardHeader>
                <CardTitle>Personality & Behavior</CardTitle>
                <CardDescription>
                  How this character will interact with you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {character.systemPrompt}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle>About the Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {(character.creatorName || 'Unknown')?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{character.creatorName || 'Unknown Creator'}</p>
                    <p className="text-sm text-muted-foreground">
                      Character Creator
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Chats</span>
                  <span className="font-medium">{character.chatCount}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Visibility</span>
                  <Badge variant={character.isPublic ? "default" : "secondary"}>
                    {character.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">{formatDate(character.createdAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {currentUser && currentUser.id === character.creatorId && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Character</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/characters/${character.id}/edit`)}
                  >
                    Edit Character
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/characters/${character.id}/analytics`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Chat Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Be specific in your questions</li>
                  <li>• The character will stay in role</li>
                  <li>• Your conversation is private</li>
                  <li>• You can start a new chat anytime</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}