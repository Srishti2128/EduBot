/**
 * Learning path generation API route handler.
 * POST /api/learning-path
 */

import { NextResponse } from 'next/server';
import { learningPathSchema } from '@/schemas/common.schema';
import { generateContent } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getCurrentUserId } from '@/lib/auth';
import { generateId } from '@/lib/utils';

/**
 * Handles POST requests to generate a personalized learning path.
 * @param request - The incoming request with topic and user level
 * @returns Generated learning path steps or error
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
    const validation = learningPathSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid input', code: 'VALIDATION_ERROR', details: validation.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { topic, currentLevel, profession } = validation.data;

    const prompt = [
      `Create a structured learning path for "${topic}" for a ${profession} at ${currentLevel} level.`,
      `Return ONLY valid JSON array of 6-10 steps:`,
      `[{`,
      `  "title": "Step title",`,
      `  "description": "What will be learned",`,
      `  "concepts": ["concept1", "concept2"],`,
      `  "estimatedMinutes": 30`,
      `}]`,
      `Order from foundational to advanced. Make it practical and engaging.`,
    ].join('\n');

    const systemPrompt = 'You are an expert curriculum designer. Create engaging, progressive learning paths. Return valid JSON only.';
    const responseText = await generateContent(prompt, systemPrompt);

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to generate path', code: 'GENERATION_ERROR' } },
        { status: 500 }
      );
    }

    const steps = JSON.parse(jsonMatch[0]).map((step: Record<string, unknown>, index: number) => ({
      id: generateId(),
      ...step,
      order: index + 1,
      status: index === 0 ? 'available' : 'locked',
    }));

    return NextResponse.json({
      success: true,
      data: { topic, steps, generatedAt: new Date().toISOString() },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: { message: errorMessage, code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
