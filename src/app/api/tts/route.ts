/**
 * Text-to-Speech API route handler.
 * POST /api/tts
 */

import { NextResponse } from 'next/server';
import { ttsRequestSchema } from '@/schemas/common.schema';
import { synthesizeSpeech } from '@/lib/tts';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getCurrentUserId } from '@/lib/auth';

/**
 * Handles POST requests for text-to-speech synthesis.
 * @param request - The incoming request with text to synthesize
 * @returns Base64-encoded audio content or error
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
    const validation = ttsRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid input', code: 'VALIDATION_ERROR', details: validation.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { text, languageCode, speakingRate } = validation.data;
    const audioBase64 = await synthesizeSpeech(text, languageCode, speakingRate);

    return NextResponse.json({
      success: true,
      data: { audio: audioBase64, mimeType: 'audio/mpeg' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: { message: errorMessage, code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
