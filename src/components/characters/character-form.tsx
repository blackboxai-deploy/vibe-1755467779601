"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Bot, Eye, Save, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const characterSchema = z.object({
  name: z.string().min(1, "Character name is required").max(50, "Name must be 50 characters or less"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be 500 characters or less"),
  systemPrompt: z.string().min(20, "System prompt must be at least 20 characters").max(2000, "System prompt must be 2000 characters or less"),
  category: z.string().min(1, "Please select a category"),
  isPublic: z.boolean(),
  avatar: z.string().optional(),
  personality: z.array(z.string()),
})

type CharacterFormValues = z.infer<typeof characterSchema>

const categories = [
  "Assistant", "Creative", "Educational", "Entertainment", "Gaming", 
  "Historical", "Professional", "Roleplay", "Storytelling", "Other"
]

const personalityTraits = [
  "Friendly", "Professional", "Humorous", "Wise", "Creative", "Analytical",
  "Empathetic", "Energetic", "Calm", "Mysterious", "Adventurous", "Scholarly"
]

const promptTemplates = [
  {
    name: "Friendly Assistant",
    prompt: "You are a helpful and friendly AI assistant. You're always polite, encouraging, and eager to help users with their questions and tasks. You explain things clearly and ask follow-up questions when needed."
  },
  {
    name: "Creative Writer",
    prompt: "You are a creative writing companion who loves storytelling, poetry, and imaginative scenarios. You help users brainstorm ideas, develop characters, and craft compelling narratives with enthusiasm and creativity."
  },
  {
    name: "Professional Mentor",
    prompt: "You are an experienced professional mentor who provides career guidance, business advice, and industry insights. You're knowledgeable, supportive, and help users develop their professional skills."
  },
  {
    name: "Educational Tutor",
    prompt: "You are a patient and knowledgeable tutor who explains complex topics in simple terms. You use examples, analogies, and interactive methods to help users learn and understand new concepts."
  }
]

interface CharacterFormProps {
  initialData?: Partial<CharacterFormValues>
  onSubmit: (data: CharacterFormValues) => Promise<void>
  isLoading?: boolean
}

export function CharacterForm({ initialData, onSubmit, isLoading = false }: CharacterFormProps) {
  const router = useRouter()
  const [previewMode, setPreviewMode] = useState(false)
  const [selectedTraits, setSelectedTraits] = useState<string[]>(initialData?.personality || [])

  const form = useForm<CharacterFormValues>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      systemPrompt: initialData?.systemPrompt || "",
      category: initialData?.category || "",
      isPublic: initialData?.isPublic ?? true,
      avatar: initialData?.avatar || "",
      personality: selectedTraits,
    },
  })

  const handleSubmit = async (data: CharacterFormValues) => {
    try {
      await onSubmit({ ...data, personality: selectedTraits })
    } catch (error) {
      console.error("Error submitting character:", error)
    }
  }

  const applyTemplate = (template: typeof promptTemplates[0]) => {
    form.setValue("systemPrompt", template.prompt)
  }

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev => 
      prev.includes(trait) 
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
    )
  }

  const generateAvatar = () => {
    const name = form.getValues("name") || "Character"
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`
    form.setValue("avatar", avatarUrl)
  }

  const watchedValues = form.watch()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {initialData ? "Edit Character" : "Create New Character"}
          </CardTitle>
          <CardDescription>
            {initialData 
              ? "Update your character's details and personality"
              : "Design an AI character with a unique personality and system prompt"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="personality">Personality</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <TabsContent value="basic" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Character Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter character name..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isPublic"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Public Character</FormLabel>
                              <FormDescription>
                                Allow other users to discover and chat with this character
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="text-center">
                        <Avatar className="h-24 w-24 mx-auto mb-4">
                          <AvatarImage src={watchedValues.avatar} />
                          <AvatarFallback>
                            {watchedValues.name?.slice(0, 2).toUpperCase() || "CH"}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generateAvatar}
                          className="flex items-center gap-2"
                        >
                          <Sparkles className="h-4 w-4" />
                          Generate Avatar
                        </Button>
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your character's role, background, and what makes them unique..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length || 0}/500 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="personality" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <FormLabel>Personality Traits</FormLabel>
                      <FormDescription className="mb-3">
                        Select traits that describe your character's personality
                      </FormDescription>
                      <div className="flex flex-wrap gap-2">
                        {personalityTraits.map((trait) => (
                          <Badge
                            key={trait}
                            variant={selectedTraits.includes(trait) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleTrait(trait)}
                          >
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <FormLabel>System Prompt Templates</FormLabel>
                      <FormDescription className="mb-3">
                        Start with a template or write your own custom prompt
                      </FormDescription>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {promptTemplates.map((template) => (
                          <Card
                            key={template.name}
                            className="cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => applyTemplate(template)}
                          >
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-2">{template.name}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {template.prompt}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="systemPrompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System Prompt</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Define how your character should behave, respond, and interact with users..."
                              className="min-h-[200px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {field.value?.length || 0}/2000 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        The system prompt defines your character's personality, knowledge, and behavior. 
                        Be specific about how they should respond to different types of questions.
                      </AlertDescription>
                    </Alert>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={watchedValues.avatar} />
                          <AvatarFallback>
                            {watchedValues.name?.slice(0, 2).toUpperCase() || "CH"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {watchedValues.name || "Unnamed Character"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {watchedValues.category || "No category"}
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-muted-foreground">
                          {watchedValues.description || "No description provided"}
                        </p>
                      </div>

                      {selectedTraits.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Personality</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedTraits.map((trait) => (
                              <Badge key={trait} variant="secondary">
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium mb-2">System Prompt</h4>
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="text-sm whitespace-pre-wrap font-mono">
                            {watchedValues.systemPrompt || "No system prompt defined"}
                          </pre>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={watchedValues.isPublic ? "default" : "secondary"}>
                          {watchedValues.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {initialData ? "Update Character" : "Create Character"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}