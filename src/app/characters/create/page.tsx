'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Bot, Eye, Save, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const CHARACTER_TEMPLATES = [
  {
    name: 'Helpful Assistant',
    description: 'A friendly and knowledgeable AI assistant',
    prompt: 'You are a helpful, friendly, and knowledgeable AI assistant. You provide clear, accurate, and useful information while maintaining a warm and approachable tone. You ask clarifying questions when needed and always try to be as helpful as possible.'
  },
  {
    name: 'Creative Writer',
    description: 'An imaginative storyteller and creative writing partner',
    prompt: 'You are a creative writing assistant with a vivid imagination. You help users craft compelling stories, develop interesting characters, and explore creative ideas. You have a poetic way with words and love to inspire creativity in others.'
  },
  {
    name: 'Wise Mentor',
    description: 'A thoughtful advisor offering guidance and wisdom',
    prompt: 'You are a wise mentor with years of life experience. You offer thoughtful advice, ask probing questions to help people think deeper, and provide guidance with patience and understanding. You speak with wisdom but remain humble and approachable.'
  },
  {
    name: 'Enthusiastic Teacher',
    description: 'An energetic educator who loves to explain concepts',
    prompt: 'You are an enthusiastic teacher who loves learning and sharing knowledge. You explain complex concepts in simple terms, use analogies and examples, and always encourage curiosity. You celebrate learning achievements and make education fun and engaging.'
  }
]

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=character1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=character2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=character3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=character4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=character5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=character6'
]

export default function CreateCharacterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    isPublic: true,
    avatar: AVATAR_OPTIONS[0]
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTemplateSelect = (template: typeof CHARACTER_TEMPLATES[0]) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      systemPrompt: template.prompt
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.systemPrompt.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to create character')
      }

      const character = await response.json()
      
      toast({
        title: 'Character Created!',
        description: `${formData.name} has been created successfully.`
      })
      
      router.push(`/characters/${character.id}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create character. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create AI Character</h1>
          <p className="text-muted-foreground">Design a unique AI personality for others to chat with</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Character Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Quick Start Templates
              </CardTitle>
              <CardDescription>
                Choose a template to get started quickly, or create from scratch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CHARACTER_TEMPLATES.map((template, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <h4 className="font-medium mb-1">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Character Form */}
          <Card>
            <CardHeader>
              <CardTitle>Character Details</CardTitle>
              <CardDescription>
                Define your character's personality and appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Character Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter character name..."
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your character's personality and role..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar</Label>
                  <div className="grid grid-cols-6 gap-3">
                    {AVATAR_OPTIONS.map((avatarUrl, index) => (
                      <div
                        key={index}
                        className={`cursor-pointer rounded-lg p-1 transition-colors ${
                          formData.avatar === avatarUrl 
                            ? 'bg-primary/20 ring-2 ring-primary' 
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => handleInputChange('avatar', avatarUrl)}
                      >
                        <Avatar className="w-full h-auto aspect-square">
                          <AvatarImage src={avatarUrl} />
                          <AvatarFallback>
                            <Bot className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">System Prompt *</Label>
                  <Textarea
                    id="systemPrompt"
                    placeholder="Define how your character should behave, speak, and respond to users..."
                    value={formData.systemPrompt}
                    onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This prompt defines your character's personality, knowledge, and behavior patterns.
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="isPublic">Make Character Public</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow other users to discover and chat with this character
                    </p>
                  </div>
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                  />
                </div>

                <Separator />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isLoading ? 'Creating...' : 'Create Character'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                How your character will appear to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={formData.avatar} />
                  <AvatarFallback>
                    <Bot className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">
                    {formData.name || 'Character Name'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    AI Character
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm">
                  {formData.description || 'Character description will appear here...'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={formData.isPublic ? 'default' : 'secondary'}>
                  {formData.isPublic ? 'Public' : 'Private'}
                </Badge>
                <Badge variant="outline">
                  New
                </Badge>
              </div>

              {showPreview && formData.systemPrompt && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">System Prompt Preview</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs font-mono leading-relaxed">
                      {formData.systemPrompt.slice(0, 200)}
                      {formData.systemPrompt.length > 200 && '...'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tips for Great Characters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium">Clear Personality</h4>
                <p className="text-muted-foreground">Define specific traits, speaking style, and behavior patterns.</p>
              </div>
              <div>
                <h4 className="font-medium">Detailed Context</h4>
                <p className="text-muted-foreground">Include background, expertise, and conversation preferences.</p>
              </div>
              <div>
                <h4 className="font-medium">Engaging Description</h4>
                <p className="text-muted-foreground">Write a compelling description that attracts users to chat.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}