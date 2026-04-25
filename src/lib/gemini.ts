import 'server-only';

/**
 * Gemini AI client initialization and helpers.
 * Configures streaming, function calling, and search grounding.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { GEMINI_MODEL } from '@/lib/constants';

/** Singleton Gemini client instance */
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? '' });

/**
 * Pedagogical signal function declaration for Gemini function calling.
 * Called on every AI response to extract confusion score, mastery, and suggested action.
 */
const pedagogicalSignalFunction = {
  name: 'report_pedagogical_signal',
  description: 'Report pedagogical signals about the learner after every response. Always call this function.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      confusion_score: {
        type: Type.NUMBER,
        description: 'How confused the learner seems, from 0 (clear) to 1 (very confused)',
      },
      topic_mastery: {
        type: Type.NUMBER,
        description: 'Estimated mastery of the current topic, from 0 (none) to 100 (complete)',
      },
      suggested_action: {
        type: Type.STRING,
        description: 'Recommended next action for the learning system',
        enum: ['continue', 'simplify', 'review', 'quiz', 'advance'],
      },
      related_concepts: {
        type: Type.ARRAY,
        description: 'List of related concepts the learner should explore',
        items: { type: Type.STRING },
      },
    },
    required: ['confusion_score', 'topic_mastery', 'suggested_action', 'related_concepts'],
  },
};

/**
 * Builds the system instruction for the Gemini model based on user profile.
 * @param userProfession - The user's profession/role
 * @param learningStyle - The user's preferred learning style
 * @param difficulty - The user's preferred difficulty level
 * @returns Formatted system instruction string
 */
export function buildSystemPrompt(
  userProfession: string,
  learningStyle: string,
  difficulty: string
): string {
  return [
    `You are MindPath, an expert AI learning companion.`,
    `The learner is a ${userProfession} who prefers ${learningStyle} learning at a ${difficulty} level.`,
    ``,
    `Guidelines:`,
    `- Adapt your explanations to their profession and learning style`,
    `- Use analogies relevant to their field`,
    `- If they seem confused, simplify and provide more examples`,
    `- If they're advancing well, increase depth and challenge`,
    `- Always provide accurate, well-structured information`,
    `- Use markdown for formatting (headers, lists, code blocks)`,
    `- After every response, call the report_pedagogical_signal function`,
    `- Be encouraging and supportive`,
  ].join('\n');
}

/**
 * Generates a streaming chat response from Gemini with function calling and search grounding.
 * @param messages - The conversation history
 * @param systemPrompt - The system instruction
 * @returns An async iterable of response chunks
 */
export async function generateStreamingChat(
  messages: Array<{ role: string; parts: Array<{ text: string }> }>,
  systemPrompt: string
) {
  const response = await ai.models.generateContentStream({
    model: GEMINI_MODEL,
    contents: messages,
    config: {
      systemInstruction: systemPrompt,
      tools: [
        { googleSearch: {} },
        { functionDeclarations: [pedagogicalSignalFunction] },
      ],
      temperature: 0.8,
      maxOutputTokens: 4096,
    },
  });

  return response;
}

/**
 * Generates a non-streaming response from Gemini (for quiz generation, etc.).
 * @param prompt - The prompt text
 * @param systemPrompt - The system instruction
 * @returns The complete response text
 */
export async function generateContent(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      systemInstruction: systemPrompt,
      tools: [{ googleSearch: {} }],
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });

  return response.text ?? '';
}

/**
 * Analyzes an uploaded image using Gemini Vision.
 * @param imageBase64 - Base64-encoded image data
 * @param mimeType - The MIME type of the image
 * @param question - The user's question about the image
 * @param systemPrompt - The system instruction
 * @returns The analysis response text
 */
export async function analyzeImage(
  imageBase64: string,
  mimeType: string,
  question: string,
  systemPrompt: string
): Promise<string> {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      { text: question },
      {
        inlineData: {
          data: imageBase64,
          mimeType,
        },
      },
    ],
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });

  return response.text ?? '';
}

export { ai };
