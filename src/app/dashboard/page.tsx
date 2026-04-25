'use client';

/**
 * Dashboard page — shows learning overview, stats, and quick actions.
 */

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { LEARNING_MODE_LABELS } from '@/lib/constants';
import Link from 'next/link';
import type { LearningMode } from '@/types';
import styles from './dashboard.module.css';

/**
 * Dashboard page component with stats, quick actions, and recent activity.
 * @returns The dashboard page JSX
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  const modes: LearningMode[] = ['guided', 'explorer', 'quiz'];
  const modeIcons: Record<LearningMode, string> = { guided: '📚', explorer: '🔍', quiz: '📝' };

  const stats = [
    { label: 'Topics Explored', value: '0', icon: '📖', color: 'var(--color-primary)' },
    { label: 'Quizzes Completed', value: '0', icon: '✅', color: 'var(--color-success)' },
    { label: 'Study Streak', value: '0 days', icon: '🔥', color: 'var(--color-warning)' },
    { label: 'Mastery Level', value: 'Novice', icon: '⭐', color: 'var(--color-accent)' },
  ];

  return (
    <div className="page-container">
      <Sidebar />
      <main id="main-content" className="main-content">
        <div className="content-area">
          {/* Welcome header */}
          <header className={styles.welcomeHeader}>
            <div>
              <h1 className={styles.welcomeTitle}>
                {greeting}, {user?.displayName?.split(' ')[0] ?? 'Learner'}! 👋
              </h1>
              <p className={styles.welcomeSubtitle}>
                Ready to learn something new today?
              </p>
            </div>
          </header>

          {/* Stats grid */}
          <section aria-labelledby="stats-heading" className={styles.statsSection}>
            <h2 id="stats-heading" className="sr-only">Your Learning Stats</h2>
            <div className={styles.statsGrid}>
              {stats.map((stat) => (
                <div key={stat.label} className={`glass-card ${styles.statCard}`}>
                  <span className={styles.statIcon} aria-hidden="true">{stat.icon}</span>
                  <div className={styles.statValue} style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick start */}
          <section aria-labelledby="quick-start-heading" className={styles.quickStartSection}>
            <h2 id="quick-start-heading" className={styles.sectionHeading}>Quick Start</h2>
            <div className={styles.modeCards}>
              {modes.map((mode) => (
                <Link
                  key={mode}
                  href={`/learn?mode=${mode}`}
                  className={`glass-card ${styles.modeCard}`}
                  id={`quick-start-${mode}`}
                >
                  <span className={styles.modeIcon} aria-hidden="true">{modeIcons[mode]}</span>
                  <h3>{LEARNING_MODE_LABELS[mode]}</h3>
                  <p className={styles.modeDescription}>
                    {mode === 'guided' && 'Step-by-step structured lessons'}
                    {mode === 'explorer' && 'Freeform AI conversation'}
                    {mode === 'quiz' && 'Test your knowledge'}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section aria-labelledby="recent-heading" className={styles.recentSection}>
            <h2 id="recent-heading" className={styles.sectionHeading}>Recent Activity</h2>
            <div className={`glass-card ${styles.emptyState}`}>
              <span className={styles.emptyIcon} aria-hidden="true">🚀</span>
              <h3>Start your learning journey!</h3>
              <p>Your recent activity will appear here once you begin exploring topics.</p>
              <Link href="/learn" className="btn btn-primary" id="start-learning-btn">
                Start Learning
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
