'use client';

/**
 * Settings page — user preferences and accessibility options.
 */

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/components/auth/AuthProvider';
import { SUPPORTED_LANGUAGES, DIFFICULTY_LABELS } from '@/lib/constants';
import type { LearningStyle, DifficultyLevel } from '@/types';
import styles from './settings.module.css';

/**
 * Settings page for configuring learning preferences and accessibility.
 * @returns The settings page JSX
 */
export default function SettingsPage() {
  const { user } = useAuth();
  const [profession, setProfession] = useState('Student');
  const [learningStyle, setLearningStyle] = useState<LearningStyle>('reading');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [language, setLanguage] = useState('en');
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [saved, setSaved] = useState(false);

  /** Saves preferences */
  function handleSave(): void {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const learningStyles: { value: LearningStyle; label: string; icon: string }[] = [
    { value: 'visual', label: 'Visual', icon: '👁️' },
    { value: 'auditory', label: 'Auditory', icon: '👂' },
    { value: 'reading', label: 'Reading/Writing', icon: '📖' },
    { value: 'kinesthetic', label: 'Hands-on', icon: '🤲' },
  ];

  return (
    <div className="page-container">
      <Sidebar />
      <main id="main-content" className="main-content">
        <div className="content-area">
          <h1>Settings</h1>
          <p className={styles.subtitle}>Customize your learning experience</p>

          {saved && (
            <div className={styles.savedBanner} role="status" aria-live="polite">
              ✅ Settings saved successfully!
            </div>
          )}

          {/* Profile */}
          <section className={`glass-card ${styles.section}`} aria-labelledby="profile-heading">
            <h2 id="profile-heading">Profile</h2>
            <div className={styles.fieldGroup}>
              <label htmlFor="settings-name" className={styles.label}>Name</label>
              <input id="settings-name" type="text" className="input" value={user?.displayName ?? ''} disabled aria-describedby="name-hint" />
              <p id="name-hint" className={styles.hint}>Managed by your Google account</p>
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="settings-profession" className={styles.label}>Profession / Role</label>
              <input id="settings-profession" type="text" className="input" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="e.g., Software Engineer, Student" aria-describedby="profession-hint" />
              <p id="profession-hint" className={styles.hint}>Helps AI personalize explanations to your field</p>
            </div>
          </section>

          {/* Learning Preferences */}
          <section className={`glass-card ${styles.section}`} aria-labelledby="learning-heading">
            <h2 id="learning-heading">Learning Preferences</h2>

            <fieldset className={styles.fieldGroup}>
              <legend className={styles.label}>Learning Style</legend>
              <div className={styles.styleGrid} role="radiogroup">
                {learningStyles.map((s) => (
                  <label key={s.value} className={`${styles.styleOption} ${learningStyle === s.value ? styles.styleActive : ''}`}>
                    <input type="radio" name="learningStyle" value={s.value} checked={learningStyle === s.value} onChange={() => setLearningStyle(s.value)} className="sr-only" />
                    <span aria-hidden="true">{s.icon}</span>
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.fieldGroup}>
              <legend className={styles.label}>Preferred Difficulty</legend>
              <div className={styles.diffGroup} role="radiogroup">
                {(Object.entries(DIFFICULTY_LABELS) as [DifficultyLevel, string][]).map(([val, label]) => (
                  <label key={val} className={`${styles.diffOption} ${difficulty === val ? styles.diffActive : ''}`}>
                    <input type="radio" name="difficulty" value={val} checked={difficulty === val} onChange={() => setDifficulty(val)} className="sr-only" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className={styles.fieldGroup}>
              <label htmlFor="settings-language" className={styles.label}>Preferred Language</label>
              <select id="settings-language" className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Accessibility */}
          <section className={`glass-card ${styles.section}`} aria-labelledby="a11y-heading">
            <h2 id="a11y-heading">Accessibility</h2>

            <div className={styles.fieldGroup}>
              <div className={styles.toggleRow}>
                <label htmlFor="high-contrast-toggle" className={styles.label}>High Contrast Mode</label>
                <button
                  id="high-contrast-toggle"
                  role="switch"
                  aria-checked={highContrast}
                  className={`${styles.toggle} ${highContrast ? styles.toggleOn : ''}`}
                  onClick={() => setHighContrast(!highContrast)}
                >
                  <span className={styles.toggleThumb} />
                </button>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="font-size-range" className={styles.label}>Font Size: {fontSize}px</label>
              <input
                id="font-size-range"
                type="range"
                min={12}
                max={24}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className={styles.range}
                aria-describedby="font-size-hint"
              />
              <p id="font-size-hint" className={styles.hint}>Adjust text size for better readability</p>
            </div>
          </section>

          <button className="btn btn-primary btn-lg" onClick={handleSave} id="save-settings-btn">
            Save Settings
          </button>
        </div>
      </main>
    </div>
  );
}
