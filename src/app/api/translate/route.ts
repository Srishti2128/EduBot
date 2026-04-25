/**
 * Translation API route handler.
 * POST /api/translate
 */

import { NextResponse } from 'next/server';
import { translateRequestSchema } from '@/schemas/common.schema';
import { translateText } from '@/lib/translate';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getCurrentUserId } from '@/lib/auth';

/**
 * Handles POST requests for text translation.
 * @param request - The incoming request with text to translate
 * @returns Translated text or error
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
    const validation = translateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid input', code: 'VALIDATION_ERROR', details: validation.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { text, targetLanguage, sourceLanguage } = validation.data;
    const translated = await translateText(text, targetLanguage, sourceLanguage);

    return NextResponse.json({
      success: true,
      data: { translatedText: translated, targetLanguage },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: { message: errorMessage, code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
