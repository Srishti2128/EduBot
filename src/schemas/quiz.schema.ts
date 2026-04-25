/**
 * Zod validation schemas for quiz API routes.
 */

import { z } from 'zod';

/** Schema for quiz generation request */
export const quizGenerateSchema = z.object({
  topicId: z.string().min(1, 'Topic ID is required'),
  topicName: z.string().min(1, 'Topic name is required').max(200),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  questionCount: z.number().int().min(1).max(20).default(5),
  questionTypes: z.array(
    z.enum(['mcq', 'true_false', 'fill_blank', 'short_answer'])
  ).min(1).default(['mcq', 'true_false']),
  concepts: z.array(z.string()).optional(),
});

/** Schema for quiz evaluation request */
export const quizEvaluateSchema = z.object({
  quizId: z.string().min(1),
  topicId: z.string().min(1),
  answers: z.array(z.object({
    questionId: z.string().min(1),
    userAnswer: z.string(),
  })).min(1),
});

/** Inferred types */
export type QuizGenerateRequest = z.infer<typeof quizGenerateSchema>;
export type QuizEvaluateRequest = z.infer<typeof quizEvaluateSchema>;
