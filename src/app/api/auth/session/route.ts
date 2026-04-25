/**
 * Session management API route handler.
 * POST /api/auth/session — Create session
 * DELETE /api/auth/session — Destroy session
 */

import { NextResponse } from 'next/server';
import { createSessionCookie, destroySession } from '@/lib/auth';
import { z } from 'zod';

/** Schema for session creation request */
const sessionSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
});

/**
 * Creates a session cookie from a Firebase ID token.
 * @param request - The incoming request with ID token
 * @returns Success status or error
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validation = sessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid input', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    const success = await createSessionCookie(validation.data.idToken);

    if (!success) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to create session', code: 'AUTH_ERROR' } },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: { message: errorMessage, code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

/**
 * Destroys the current session.
 * @returns Success status
 */
export async function DELETE(): Promise<Response> {
  try {
    await destroySession();
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: { message: errorMessage, code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
