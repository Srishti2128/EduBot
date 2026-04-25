/**
 * Zod validation schemas for progress and common API routes.
 */

import { z } from 'zod';

/** Schema for progress update request */
export const progressUpdateSchema = z.object({
  topicId: z.string().min(1),
  conceptId: z.string().min(1),
  quality: z.number().int().min(0).max(5),
});

/** Schema for TTS request */
export const ttsRequestSchema = z.object({
  text: z.string().min(1, 'Text is required').max(5000, 'Text too long for TTS'),
  languageCode: z.string().min(2).max(10).default('en-US'),
  speakingRate: z.number().min(0.25).max(4.0).default(1.0),
});

/** Schema for translation request */
export const translateRequestSchema = z.object({
  text: z.string().min(1, 'Text is required').max(10000),
  targetLanguage: z.string().min(2).max(5),
  sourceLanguage: z.string().min(2).max(5).optional(),
});

/** Schema for learning path generation request */
export const learningPathSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(200),
  currentLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  profession: z.string().min(1).max(100).default('student'),
});

/** Schema for user profile update */
export const userProfileSchema = z.object({
  profession: z.string().min(1).max(100),
  learningStyle: z.enum(['visual', 'auditory', 'reading', 'kinesthetic']),
  preferredDifficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  preferredLanguage: z.string().min(2).max(5),
});

/** Inferred types */
export type ProgressUpdateRequest = z.infer<typeof progressUpdateSchema>;
export type TTSRequest = z.infer<typeof ttsRequestSchema>;
export type TranslateRequest = z.infer<typeof translateRequestSchema>;
export type LearningPathRequest = z.infer<typeof learningPathSchema>;
export type UserProfileUpdate = z.infer<typeof userProfileSchema>;
