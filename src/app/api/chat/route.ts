/**
 * Chat API route handler.
 * Streams AI responses using Gemini with function calling and search grounding.
 * POST /api/chat
 */

import { NextResponse } from 'next/server';
import { chatRequestSchema } from '@/schemas/chat.schema';
import { generateStreamingChat, buildSystemPrompt } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getCurrentUserId } from '@/lib/auth';

/**
 * Handles POST requests for AI-powered learning chat.
 * Streams responses using Server-Sent Events (SSE).
 * @param request - The incoming request with chat messages
 * @returns Streaming response or error
 */
export async function POST(request: Request): Promise<Response> {
  try {
    /* Authenticate user */
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    /* Rate limiting */
    const rateLimitResult = checkRateLimit(userId);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Too many requests. Please wait before sending another message.',
            code: 'RATE_LIMITED',
          },
        },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(rateLimitResult.resetMs / 1000)) },
        }
      );
    }

    /* Validate input with Zod */
    const body = await request.json();
    const validation = chatRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid input',
            code: 'VALIDATION_ERROR',
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { messages, mode, userProfession, learningStyle, difficulty } = validation.data;

    /* Build system prompt with user personalization */
    const systemPrompt = buildSystemPrompt(userProfession, learningStyle, difficulty);

    /* Convert messages to Gemini format */
    const geminiMessages = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    /* Add mode-specific context */
    const modeContext = getModeContext(mode);
    if (modeContext) {
      geminiMessages[geminiMessages.length - 1].parts[0].text += `\n\n[Learning Mode: ${mode}] ${modeContext}`;
    }

    /* Generate streaming response */
    const streamResponse = await generateStreamingChat(geminiMessages, systemPrompt);

    /* Create a ReadableStream for SSE */
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResponse) {
            /* Handle text content */
            if (chunk.text) {
              const data = JSON.stringify({ type: 'text', content: chunk.text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }

            /* Handle function calls (pedagogical signals) */
            if (chunk.functionCalls && chunk.functionCalls.length > 0) {
              for (const fc of chunk.functionCalls) {
                if (fc.name === 'report_pedagogical_signal') {
                  const data = JSON.stringify({ type: 'signal', content: fc.args });
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                }
              }
            }
          }

          /* Send done signal */
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Stream error';
          const data = JSON.stringify({ type: 'error', content: errorMessage });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
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

/**
 * Returns mode-specific context instructions for the AI.
 * @param mode - The learning mode
 * @returns Additional instructions for the mode
 */
function getModeContext(mode: string): string {
  switch (mode) {
    case 'guided':
      return 'Provide structured, step-by-step lessons. Break concepts into digestible chunks. Include examples after each concept.';
    case 'explorer':
      return 'Respond naturally to questions. Encourage curiosity. Provide in-depth explanations when asked.';
    case 'quiz':
      return 'Generate assessment questions based on the topic. Provide immediate feedback and explanations.';
    default:
      return '';
  }
}
