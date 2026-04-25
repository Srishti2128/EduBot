import 'server-only';

/**
 * Google Cloud Text-to-Speech client wrapper.
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { TTS_DEFAULT_LANGUAGE, TTS_DEFAULT_RATE } from '@/lib/constants';

/** Singleton TTS client */
let ttsClient: TextToSpeechClient | null = null;

/**
 * Returns the Text-to-Speech client singleton.
 * @returns The TTS client instance
 */
function getClient(): TextToSpeechClient {
  if (!ttsClient) {
    ttsClient = new TextToSpeechClient();
  }
  return ttsClient;
}

/**
 * Synthesizes speech from text using Google Cloud TTS.
 * @param text - The text to convert to speech
 * @param languageCode - BCP-47 language code (default: en-US)
 * @param speakingRate - Speaking rate (0.25 to 4.0, default: 1.0)
 * @returns Base64-encoded audio content (MP3)
 */
export async function synthesizeSpeech(
  text: string,
  languageCode: string = TTS_DEFAULT_LANGUAGE,
  speakingRate: number = TTS_DEFAULT_RATE
): Promise<string> {
  const client = getClient();

  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: {
      languageCode,
      ssmlGender: 'NEUTRAL' as const,
    },
    audioConfig: {
      audioEncoding: 'MP3' as const,
      speakingRate,
    },
  });

  if (!response.audioContent) {
    throw new Error('No audio content returned from TTS');
  }

  const audioBuffer = response.audioContent as Buffer;
  return audioBuffer.toString('base64');
}
