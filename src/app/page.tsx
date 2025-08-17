"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Users, Sparkles, Plus, ArrowRight, Star, Zap, Shield } from "lucide-react";

interface FeaturedCharacter {
  id: string;
  name: string;
  description: string;
  avatar: string;
  category: string;
  chatCount: number;
}

export default function HomePage() {
  const [featuredCharacters, setFeaturedCharacters] = useState<FeaturedCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading featured characters
    setTimeout(() => {
      setFeaturedCharacters([
        {
          id: "1",
          name: "Aria the Wise",
          description: "A knowledgeable mentor who provides thoughtful guidance and philosophical insights.",
          avatar: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/48b77195-8de3-46a3-9c55-9f08725400d1.png",
          category: "Mentor",
          chatCount: 1247
        },
        {
          id: "2",
          name: "Captain Nova",
          description: "A space explorer with tales of distant galaxies and cosmic adventures.",
          avatar: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/d6a69e3d-1397-4c63-bf0c-e73d752f752a.png",
          category: "Adventure",
          chatCount: 892
        },
        {
          id: "3",
          name: "Dr. Pixel",
          description: "A tech-savvy AI researcher who loves discussing programming and innovation.",
          avatar: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/570c40b1-d621-4f21-b9ac-097bf141df76.png",
          category: "Tech",
          chatCount: 1156
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">CharacterAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/characters">
                <Button variant="ghost">Browse Characters</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Chat with AI Characters
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Create, discover, and chat with unique AI personalities. Build your own characters or explore thousands created by our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Chatting <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/characters">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Browse Characters
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose CharacterAI?</h2>
          <p className="text-xl text-muted-foreground">Powered by advanced AI technology for the most engaging conversations</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Intelligent Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Experience natural, engaging conversations powered by Claude Sonnet-4, one of the most advanced AI models available.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Create Your Own</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Design unique AI characters with custom personalities, backgrounds, and conversation styles using our intuitive character creator.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Community Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Discover thousands of characters created by our community. From mentors to adventurers, find the perfect conversation partner.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Characters */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Featured Characters</h2>
          <p className="text-xl text-muted-foreground">Start conversations with our most popular AI personalities</p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-24"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {featuredCharacters.map((character) => (
              <Card key={character.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={character.avatar} alt={character.name} />
                      <AvatarFallback>{character.name?.slice(0, 2) || 'CH'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="group-hover:text-primary transition-colors">{character.name}</CardTitle>
                      <Badge variant="secondary">{character.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{character.description}</CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {character.chatCount.toLocaleString()} chats
                    </div>
                    <Link href={`/characters/${character.id}`}>
                      <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Chat Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/characters">
            <Button size="lg" variant="outline">
              View All Characters <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
            <div className="text-muted-foreground">Active Users</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
            <div className="text-muted-foreground">AI Characters</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">1M+</div>
            <div className="text-muted-foreground">Conversations</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
            <div className="text-muted-foreground">Uptime</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center bg-primary/5 rounded-3xl mx-4 mb-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your AI Adventure?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users already having amazing conversations with AI characters. Create your account in seconds and dive into a world of endless possibilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8 py-6">
                <Zap className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
            <Link href="/characters/create">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <Plus className="mr-2 h-5 w-5" />
                Create Character
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">CharacterAI</span>
              </div>
              <p className="text-muted-foreground">
                The ultimate platform for AI character conversations and creation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/characters" className="hover:text-foreground transition-colors">Browse Characters</Link></li>
                <li><Link href="/characters/create" className="hover:text-foreground transition-colors">Create Character</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
                <li><Link href="/community" className="hover:text-foreground transition-colors">Community</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 CharacterAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}