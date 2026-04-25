/**
 * Core type definitions for MindPath application.
 * All shared interfaces and types used across the app.
 */

/** Supported learning modes */
export type LearningMode = 'guided' | 'explorer' | 'quiz';

/** User difficulty level */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/** User's preferred learning style */
export type LearningStyle = 'visual' | 'auditory' | 'reading' | 'kinesthetic';

/** Quiz question types */
export type QuestionType = 'mcq' | 'true_false' | 'fill_blank' | 'short_answer';

/** User profile stored in Firestore */
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  profession: string;
  learningStyle: LearningStyle;
  preferredDifficulty: DifficultyLevel;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
}

/** Chat message in a learning conversation */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: MessageMetadata;
}

/** Metadata returned from Gemini function calling */
export interface MessageMetadata {
  confusionScore: number;
  topicMastery: number;
  suggestedAction: 'continue' | 'simplify' | 'review' | 'quiz' | 'advance';
  relatedConcepts: string[];
  searchGrounding?: GroundingSource[];
}

/** Google Search grounding source */
export interface GroundingSource {
  title: string;
  url: string;
  snippet: string;
}

/** Learning topic tracked in Firestore */
export interface LearningTopic {
  id: string;
  userId: string;
  name: string;
  description: string;
  masteryLevel: number;
  totalSessions: number;
  lastStudied: string;
  embedding?: number[];
  concepts: ConceptNode[];
  createdAt: string;
}

/** Single concept within a topic */
export interface ConceptNode {
  id: string;
  name: string;
  mastery: number;
  connections: string[];
  lastReviewed: string | null;
  nextReview: string | null;
  sm2Data: SM2Data;
}

/** SM-2 spaced repetition algorithm data */
export interface SM2Data {
  interval: number;
  repetition: number;
  efactor: number;
}

/** Quiz question */
export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: DifficultyLevel;
  conceptId: string;
}

/** Quiz attempt result */
export interface QuizResult {
  id: string;
  userId: string;
  topicId: string;
  questions: QuizQuestion[];
  userAnswers: string[];
  score: number;
  totalQuestions: number;
  completedAt: string;
  feedback: string;
}

/** Pre-mortem baseline assessment */
export interface PreMortemAssessment {
  id: string;
  userId: string;
  topicId: string;
  baselineScore: number;
  knowledgeGaps: string[];
  assessedAt: string;
}

/** Learning path step */
export interface LearningPathStep {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  order: number;
  conceptIds: string[];
}

/** Learning session */
export interface LearningSession {
  id: string;
  userId: string;
  topicId: string;
  mode: LearningMode;
  startedAt: string;
  endedAt: string | null;
  messagesCount: number;
  confusionEvents: number;
  preMortem?: PreMortemAssessment;
}

/** User progress summary */
export interface ProgressSummary {
  totalTopics: number;
  totalSessions: number;
  totalQuizzes: number;
  averageMastery: number;
  currentStreak: number;
  longestStreak: number;
  lastActive: string;
  topicBreakdown: TopicBreakdown[];
}

/** Per-topic progress breakdown */
export interface TopicBreakdown {
  topicId: string;
  topicName: string;
  mastery: number;
  sessionsCount: number;
  quizzesCount: number;
  lastStudied: string;
}

/** API error response */
export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}

/** API success response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/** TTS request */
export interface TTSRequest {
  text: string;
  languageCode: string;
  voiceName?: string;
  speakingRate?: number;
}

/** Translation request */
export interface TranslationRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

/** Firebase Analytics custom event names */
export const ANALYTICS_EVENTS = {
  LESSON_STARTED: 'lesson_started',
  QUIZ_COMPLETED: 'quiz_completed',
  CONCEPT_MASTERED: 'concept_mastered',
  LEARNING_MODE_SWITCHED: 'learning_mode_switched',
  CONFUSION_DETECTED: 'confusion_detected',
  TTS_ACTIVATED: 'tts_activated',
  IMAGE_UPLOADED: 'image_uploaded',
  LANGUAGE_CHANGED: 'language_changed',
} as const;
