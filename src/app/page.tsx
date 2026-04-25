'use client';

/**
 * Landing page — public route.
 * Features hero section, feature showcase, and Google Sign-In CTA.
 */

import { useAuth } from '@/components/auth/AuthProvider';
import { APP_NAME, LEARNING_MODE_LABELS, LEARNING_MODE_DESCRIPTIONS } from '@/lib/constants';
import type { LearningMode } from '@/types';
import styles from './page.module.css';

/**
 * Landing page component with hero, features, and sign-in.
 * @returns The landing page JSX
 */
export default function LandingPage() {
  const { signInWithGoogle, loading } = useAuth();

  const features = [
    {
      icon: '🧠',
      title: 'AI-Powered Learning',
      description: 'Powered by Google Gemini with real-time search grounding for accurate, up-to-date knowledge.',
    },
    {
      icon: '📊',
      title: 'Adaptive Learning',
      description: 'AI detects your confusion level and adapts explanations, pace, and difficulty in real-time.',
    },
    {
      icon: '🗺️',
      title: 'Knowledge Graph',
      description: 'Visualize your learning journey with an interactive concept map showing mastery levels.',
    },
    {
      icon: '📝',
      title: 'Smart Quizzes',
      description: 'AI-generated assessments with instant feedback and SM-2 spaced repetition scheduling.',
    },
    {
      icon: '🔊',
      title: 'Multi-Sensory',
      description: 'Learn through text, audio (Google TTS), visuals, and interactive exercises.',
    },
    {
      icon: '🌍',
      title: 'Multi-Language',
      description: 'Learn in 100+ languages with Google Cloud Translation powering seamless localization.',
    },
  ];

  const modes: LearningMode[] = ['guided', 'explorer', 'quiz'];

  return (
    <main id="main-content" className={styles.landing}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon} aria-hidden="true">⚡</span>
          <span className={styles.logoText}>{APP_NAME}</span>
        </div>
        <button
          className="btn btn-primary"
          onClick={signInWithGoogle}
          disabled={loading}
          id="header-sign-in"
          aria-label="Sign in with Google"
        >
          {loading ? 'Loading...' : 'Get Started'}
        </button>
      </header>

      {/* Hero */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroGlow} aria-hidden="true" />
        <h1 id="hero-heading" className={styles.heroTitle}>
          Learn Smarter with
          <span className={styles.gradientText}> AI That Adapts</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Your intelligent learning companion that personalizes content,
          adapts to your pace, and helps you master any concept effectively.
        </p>
        <div className={styles.heroCta}>
          <button
            className="btn btn-primary btn-lg"
            onClick={signInWithGoogle}
            disabled={loading}
            id="hero-sign-in"
            aria-label="Sign in with Google to start learning"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
        <p className={styles.heroNote}>Free to use • Powered by Google Cloud</p>
      </section>

      {/* Learning Modes */}
      <section className={styles.modesSection} aria-labelledby="modes-heading">
        <h2 id="modes-heading" className={styles.sectionTitle}>3 Learning Modes</h2>
        <div className={styles.modesGrid} role="group" aria-label="Learning modes">
          {modes.map((mode) => (
            <div key={mode} className={`glass-card ${styles.modeCard}`}>
              <div className={styles.modeIcon} aria-hidden="true">
                {mode === 'guided' ? '📚' : mode === 'explorer' ? '🔍' : '📝'}
              </div>
              <h3>{LEARNING_MODE_LABELS[mode]}</h3>
              <p>{LEARNING_MODE_DESCRIPTIONS[mode]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={styles.featuresSection} aria-labelledby="features-heading">
        <h2 id="features-heading" className={styles.sectionTitle}>Why MindPath?</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature) => (
            <div key={feature.title} className={`glass-card ${styles.featureCard}`}>
              <span className={styles.featureIcon} aria-hidden="true">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} {APP_NAME}. Built with Google Gemini, Firebase, and Cloud Run.</p>
      </footer>
    </main>
  );
}
