import 'server-only';

/**
 * Google Cloud Translation API client wrapper.
 */

import { TranslationServiceClient } from '@google-cloud/translate';

/** Singleton translation client */
let translateClient: TranslationServiceClient | null = null;

/**
 * Returns the Translation client singleton.
 * @returns The Translation client instance
 */
function getClient(): TranslationServiceClient {
  if (!translateClient) {
    translateClient = new TranslationServiceClient();
  }
  return translateClient;
}

/**
 * Translates text to the target language using Google Cloud Translation.
 * @param text - The text to translate
 * @param targetLanguage - Target language code (e.g., 'es', 'fr')
 * @param sourceLanguage - Source language code (optional, auto-detect if omitted)
 * @returns The translated text
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<string> {
  const client = getClient();
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

  const [response] = await client.translateText({
    parent: `projects/${projectId}/locations/global`,
    contents: [text],
    targetLanguageCode: targetLanguage,
    sourceLanguageCode: sourceLanguage,
    mimeType: 'text/plain',
  });

  const translation = response.translations?.[0]?.translatedText;
  if (!translation) {
    throw new Error('No translation returned');
  }

  return translation;
}

/**
 * Detects the language of the given text.
 * @param text - The text to detect the language of
 * @returns The detected language code and confidence
 */
export async function detectLanguage(
  text: string
): Promise<{ languageCode: string; confidence: number }> {
  const client = getClient();
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

  const [response] = await client.detectLanguage({
    parent: `projects/${projectId}/locations/global`,
    content: text,
    mimeType: 'text/plain',
  });

  const detection = response.languages?.[0];
  return {
    languageCode: detection?.languageCode ?? 'en',
    confidence: detection?.confidence ?? 0,
  };
}
