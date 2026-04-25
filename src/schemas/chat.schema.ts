/**
 * Zod validation schemas for chat API routes.
 */

import { z } from 'zod';

/** Schema for a single chat message */
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Message cannot be empty').max(10000, 'Message too long'),
});

/** Schema for chat request body */
export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, 'At least one message required'),
  topicId: z.string().min(1, 'Topic ID is required'),
  mode: z.enum(['guided', 'explorer', 'quiz']),
  userProfession: z.string().min(1).max(100).default('student'),
  learningStyle: z.enum(['visual', 'auditory', 'reading', 'kinesthetic']).default('reading'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
});

/** Schema for image analysis request body */
export const imageAnalysisSchema = z.object({
  imageBase64: z.string().min(1, 'Image data is required'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  question: z.string().min(1, 'Question is required').max(2000),
  topicId: z.string().min(1),
});

/** Inferred types from schemas */
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ImageAnalysisRequest = z.infer<typeof imageAnalysisSchema>;
