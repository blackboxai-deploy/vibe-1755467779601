import { z } from "zod"

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password must be less than 100 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
})

export const updateProfileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address")
})

// Character validation schemas
export const createCharacterSchema = z.object({
  name: z.string().min(1, "Character name is required").max(50, "Character name must be less than 50 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  systemPrompt: z.string().min(20, "System prompt must be at least 20 characters").max(2000, "System prompt must be less than 2000 characters"),
  isPublic: z.boolean().default(true),
  avatar: z.string().url("Invalid avatar URL").optional().or(z.literal(""))
})

export const updateCharacterSchema = z.object({
  name: z.string().min(1, "Character name is required").max(50, "Character name must be less than 50 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters").optional(),
  systemPrompt: z.string().min(20, "System prompt must be at least 20 characters").max(2000, "System prompt must be less than 2000 characters").optional(),
  isPublic: z.boolean().optional(),
  avatar: z.string().url("Invalid avatar URL").optional().or(z.literal(""))
})

// Chat validation schemas
export const sendMessageSchema = z.object({
  characterId: z.string().uuid("Invalid character ID"),
  message: z.string().min(1, "Message cannot be empty").max(1000, "Message must be less than 1000 characters"),
  chatId: z.string().uuid("Invalid chat ID").optional()
})

export const createChatSchema = z.object({
  characterId: z.string().uuid("Invalid character ID")
})

// API response schemas
export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  details: z.any().optional()
})

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "name", "chatCount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
})

// Data model schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string(),
  passwordHash: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional()
})

export const characterSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  systemPrompt: z.string(),
  creatorId: z.string().uuid(),
  isPublic: z.boolean(),
  avatar: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  chatCount: z.number().default(0)
})

export const messageSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string().datetime()
})

export const chatSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  characterId: z.string().uuid(),
  messages: z.array(messageSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type CreateChatInput = z.infer<typeof createChatSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type User = z.infer<typeof userSchema>
export type Character = z.infer<typeof characterSchema>
export type Message = z.infer<typeof messageSchema>
export type Chat = z.infer<typeof chatSchema>
export type ApiError = z.infer<typeof apiErrorSchema>