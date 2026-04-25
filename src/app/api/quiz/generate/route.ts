/**
 * Quiz generation API route handler.
 * Generates AI-powered quiz questions using Gemini.
 * POST /api/quiz/generate
 */

import { NextResponse } from 'next/server';
import { quizGenerateSchema } from '@/schemas/quiz.schema';
import { generateContent } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getCurrentUserId } from '@/lib/auth';
import { generateId } from '@/lib/utils';

/**
 * Handles POST requests to generate quiz questions.
 * @param request - The incoming request
 * @returns Generated quiz questions or error
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const rateLimitResult = checkRateLimit(userId);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Rate limited', code: 'RATE_LIMITED' } },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitResult.resetMs / 1000)) } }
      );
    }

    const body = await request.json();
    const validation = quizGenerateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid input', code: 'VALIDATION_ERROR', details: validation.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { topicName, difficulty, questionCount, questionTypes } = validation.data;

    const prompt = [
      `Generate exactly ${questionCount} quiz questions about "${topicName}" at ${difficulty} level.`,
      `Question types to include: ${questionTypes.join(', ')}.`,
      `Return ONLY valid JSON array with this structure:`,
      `[{`,
      `  "id": "unique-id",`,
      `  "type": "mcq|true_false|fill_blank|short_answer",`,
      `  "question": "the question text",`,
      `  "options": ["A", "B", "C", "D"] (only for mcq, 4 options),`,
      `  "correctAnswer": "the correct answer",`,
      `  "explanation": "why this is correct",`,
      `  "difficulty": "${difficulty}"`,
      `}]`,
      `Ensure questions test understanding, not just memorization.`,
    ].join('\n');

    const systemPrompt = 'You are an expert quiz generator for educational purposes. Always return valid JSON.';
    const responseText = await generateContent(prompt, systemPrompt);

    /* Parse the JSON response */
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to generate quiz', code: 'GENERATION_ERROR' } },
        { status: 500 }
      );
    }

    const questions = JSON.parse(jsonMatch[0]).map((q: Record<string, unknown>) => ({
      ...q,
      id: q.id || generateId(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        quizId: generateId(),
        questions,
        topicName,
        difficulty,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: { message: errorMessage, code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
