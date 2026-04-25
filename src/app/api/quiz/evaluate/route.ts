/**
 * Quiz evaluation API route handler.
 * Evaluates user answers and updates progress.
 * POST /api/quiz/evaluate
 */

import { NextResponse } from 'next/server';
import { quizEvaluateSchema } from '@/schemas/quiz.schema';
import { generateContent } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getCurrentUserId } from '@/lib/auth';

/**
 * Handles POST requests to evaluate quiz answers.
 * @param request - The incoming request with user answers
 * @returns Evaluation results with feedback
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
    const validation = quizEvaluateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid input', code: 'VALIDATION_ERROR', details: validation.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { answers } = validation.data;

    const prompt = [
      `Evaluate the following quiz answers and provide feedback.`,
      `Answers: ${JSON.stringify(answers)}`,
      `Return ONLY valid JSON with:`,
      `{`,
      `  "score": <number 0-100>,`,
      `  "correctCount": <number>,`,
      `  "totalQuestions": <number>,`,
      `  "feedback": "overall feedback string",`,
      `  "questionFeedback": [{ "questionId": "...", "correct": true/false, "explanation": "..." }]`,
      `}`,
    ].join('\n');

    const systemPrompt = 'You are an expert quiz evaluator. Provide encouraging, constructive feedback. Return valid JSON only.';
    const responseText = await generateContent(prompt, systemPrompt);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to evaluate quiz', code: 'EVALUATION_ERROR' } },
        { status: 500 }
      );
    }

    const evaluation = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: {
        ...evaluation,
        evaluatedAt: new Date().toISOString(),
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
