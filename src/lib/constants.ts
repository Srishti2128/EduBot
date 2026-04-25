/**
 * Application-wide constants.
 * All hardcoded strings and configuration values are centralized here.
 */

/** Application metadata */
export const APP_NAME = 'MindPath';
export const APP_DESCRIPTION = 'AI-Powered Learning Companion that adapts to your pace and understanding';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

/** Gemini model configuration */
export const GEMINI_MODEL = 'gemini-2.5-flash';
export const GEMINI_VISION_MODEL = 'gemini-2.5-flash';

/** Rate limiting */
export const RATE_LIMIT_MAX_REQUESTS = 20;
export const RATE_LIMIT_WINDOW_MS = 60_000;

/** SM-2 algorithm defaults */
export const SM2_DEFAULT_EFACTOR = 2.5;
export const SM2_MIN_EFACTOR = 1.3;

/** Session cookie */
export const SESSION_COOKIE_NAME = 'mindpath_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/** Protected route paths */
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/learn',
  '/quiz',
  '/progress',
  '/settings',
] as const;

/** Public route paths */
export const PUBLIC_ROUTES = [
  '/',
  '/api/auth/session',
] as const;

/** Learning mode labels */
export const LEARNING_MODE_LABELS = {
  guided: 'Guided Mode',
  explorer: 'Explorer Mode',
  quiz: 'Quiz Mode',
} as const;

/** Learning mode descriptions */
export const LEARNING_MODE_DESCRIPTIONS = {
  guided: 'Step-by-step structured lessons with AI-generated curriculum',
  explorer: 'Freeform conversational learning — ask anything',
  quiz: 'Test your knowledge with AI-generated assessments',
} as const;

/** Difficulty labels */
export const DIFFICULTY_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
} as const;

/** Navigation links */
export const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/learn', label: 'Learn', icon: 'learn' },
  { href: '/quiz', label: 'Quiz', icon: 'quiz' },
  { href: '/progress', label: 'Progress', icon: 'progress' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
] as const;

/** Supported languages for translation */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ar', name: 'Arabic' },
] as const;

/** TTS voice options */
export const TTS_DEFAULT_LANGUAGE = 'en-US';
export const TTS_DEFAULT_RATE = 1.0;

/** Firestore collection names */
export const COLLECTIONS = {
  USERS: 'users',
  TOPICS: 'topics',
  SESSIONS: 'sessions',
  QUIZZES: 'quizzes',
  PROGRESS: 'progress',
  CHAT_HISTORY: 'chatHistory',
} as const;

/** Mastery level thresholds */
export const MASTERY_THRESHOLDS = {
  NOVICE: 0,
  BEGINNER: 20,
  DEVELOPING: 40,
  PROFICIENT: 60,
  ADVANCED: 80,
  MASTERED: 95,
} as const;

/** Mastery level labels */
export const MASTERY_LABELS: Record<string, string> = {
  novice: 'Novice',
  beginner: 'Beginner',
  developing: 'Developing',
  proficient: 'Proficient',
  advanced: 'Advanced',
  mastered: 'Mastered',
};

/**
 * Returns the mastery label for a given mastery percentage.
 * @param mastery - The mastery percentage (0-100)
 * @returns The human-readable mastery label
 */
export function getMasteryLabel(mastery: number): string {
  if (mastery >= MASTERY_THRESHOLDS.MASTERED) return 'Mastered';
  if (mastery >= MASTERY_THRESHOLDS.ADVANCED) return 'Advanced';
  if (mastery >= MASTERY_THRESHOLDS.PROFICIENT) return 'Proficient';
  if (mastery >= MASTERY_THRESHOLDS.DEVELOPING) return 'Developing';
  if (mastery >= MASTERY_THRESHOLDS.BEGINNER) return 'Beginner';
  return 'Novice';
}
