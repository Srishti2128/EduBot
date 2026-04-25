'use client';

/**
 * Firebase Analytics wrapper for tracking custom events.
 * All event names are defined in constants to prevent typos.
 */

import { logEvent } from 'firebase/analytics';
import { getFirebaseAnalytics } from '@/lib/firebase';
import type { LearningMode } from '@/types';

/**
 * Logs a custom analytics event to Firebase Analytics.
 * Safely handles cases where analytics is unavailable.
 * @param eventName - The event name to log
 * @param eventParams - Additional event parameters
 */
async function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
): Promise<void> {
  const analytics = await getFirebaseAnalytics();
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  }
}

/**
 * Tracks when a lesson/learning session is started.
 * @param topicName - The topic being learned
 * @param mode - The learning mode selected
 */
export async function trackLessonStarted(topicName: string, mode: LearningMode): Promise<void> {
  await trackEvent('lesson_started', { topic: topicName, mode });
}

/**
 * Tracks when a quiz is completed.
 * @param topicName - The topic of the quiz
 * @param score - The score achieved (0-100)
 * @param totalQuestions - Total number of questions
 */
export async function trackQuizCompleted(
  topicName: string,
  score: number,
  totalQuestions: number
): Promise<void> {
  await trackEvent('quiz_completed', { topic: topicName, score, total_questions: totalQuestions });
}

/**
 * Tracks when a concept is mastered (mastery >= 95%).
 * @param conceptName - The name of the mastered concept
 */
export async function trackConceptMastered(conceptName: string): Promise<void> {
  await trackEvent('concept_mastered', { concept: conceptName });
}

/**
 * Tracks when the learning mode is switched.
 * @param fromMode - The previous mode
 * @param toMode - The new mode
 */
export async function trackModeSwitched(fromMode: LearningMode, toMode: LearningMode): Promise<void> {
  await trackEvent('learning_mode_switched', { from: fromMode, to: toMode });
}

/**
 * Tracks when the AI detects learner confusion.
 * @param topicName - The topic where confusion was detected
 * @param confusionScore - The confusion score (0-1)
 */
export async function trackConfusionDetected(
  topicName: string,
  confusionScore: number
): Promise<void> {
  await trackEvent('confusion_detected', { topic: topicName, score: confusionScore });
}

/**
 * Tracks when text-to-speech is activated.
 * @param language - The language code used
 */
export async function trackTTSActivated(language: string): Promise<void> {
  await trackEvent('tts_activated', { language });
}

/**
 * Tracks when an image is uploaded for analysis.
 * @param fileSize - The file size in bytes
 */
export async function trackImageUploaded(fileSize: number): Promise<void> {
  await trackEvent('image_uploaded', { file_size: fileSize });
}

/**
 * Tracks when the interface language is changed.
 * @param language - The new language code
 */
export async function trackLanguageChanged(language: string): Promise<void> {
  await trackEvent('language_changed', { language });
}
