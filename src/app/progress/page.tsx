'use client';

/**
 * Progress page — learning analytics, knowledge graph, and topic breakdown.
 */

import { Sidebar } from '@/components/layout/Sidebar';
import { getMasteryLabel } from '@/lib/constants';
import styles from './progress.module.css';

/** Sample progress data structure */
interface TopicProgress {
  name: string;
  mastery: number;
  sessions: number;
  lastStudied: string;
}

/**
 * Progress page with knowledge graph, stats, and topic breakdown.
 * @returns The progress page JSX
 */
export default function ProgressPage() {
  /* Initial empty state — will be populated from Firestore */
  const topics: TopicProgress[] = [];
  const overallStats = {
    totalTopics: 0,
    totalSessions: 0,
    avgMastery: 0,
    streak: 0,
  };

  return (
    <div className="page-container">
      <Sidebar />
      <main id="main-content" className="main-content">
        <div className="content-area">
          <h1>Learning Progress</h1>
          <p className={styles.subtitle}>Track your mastery and learning journey</p>

          {/* Stats overview */}
          <section aria-labelledby="overview-heading" className={styles.overviewSection}>
            <h2 id="overview-heading" className="sr-only">Progress Overview</h2>
            <div className={styles.statsRow}>
              {[
                { label: 'Topics', value: overallStats.totalTopics, icon: '📖' },
                { label: 'Sessions', value: overallStats.totalSessions, icon: '💡' },
                { label: 'Avg Mastery', value: `${overallStats.avgMastery}%`, icon: '🎯' },
                { label: 'Streak', value: `${overallStats.streak}d`, icon: '🔥' },
              ].map((stat) => (
                <div key={stat.label} className={`glass-card ${styles.statBox}`}>
                  <span aria-hidden="true">{stat.icon}</span>
                  <div className={styles.statVal}>{stat.value}</div>
                  <div className={styles.statLbl}>{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Knowledge graph placeholder */}
          <section aria-labelledby="graph-heading" className={styles.graphSection}>
            <h2 id="graph-heading">Knowledge Graph</h2>
            <div
              className={`glass-card ${styles.graphContainer}`}
              role="img"
              aria-label="Interactive knowledge graph showing concept relationships and mastery levels. Currently empty — start learning to populate."
            >
              <div className={styles.graphPlaceholder}>
                <span aria-hidden="true">🗺️</span>
                <p>Your knowledge graph will appear here as you learn new concepts.</p>
                <p className={styles.graphHint}>Concepts will be connected based on semantic similarity.</p>
              </div>
            </div>

            {/* Accessible table fallback for knowledge graph */}
            {topics.length > 0 && (
              <div className={styles.tableFallback}>
                <h3 className="sr-only">Knowledge Graph Data (Table View)</h3>
                <table className={styles.progressTable} aria-label="Topic mastery breakdown">
                  <thead>
                    <tr>
                      <th scope="col">Topic</th>
                      <th scope="col">Mastery</th>
                      <th scope="col">Level</th>
                      <th scope="col">Sessions</th>
                      <th scope="col">Last Studied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topics.map((t) => (
                      <tr key={t.name}>
                        <td>{t.name}</td>
                        <td>{t.mastery}%</td>
                        <td>{getMasteryLabel(t.mastery)}</td>
                        <td>{t.sessions}</td>
                        <td>{t.lastStudied}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Topic breakdown */}
          <section aria-labelledby="topics-heading" className={styles.topicsSection}>
            <h2 id="topics-heading">Topic Breakdown</h2>
            {topics.length === 0 ? (
              <div className={`glass-card ${styles.emptyState}`}>
                <span aria-hidden="true">📊</span>
                <h3>No progress yet</h3>
                <p>Start learning to see your topic-by-topic progress breakdown here.</p>
              </div>
            ) : (
              <div className={styles.topicList}>
                {topics.map((t) => (
                  <div key={t.name} className={`glass-card ${styles.topicCard}`}>
                    <div className={styles.topicHeader}>
                      <h3>{t.name}</h3>
                      <span className="badge badge-primary">{getMasteryLabel(t.mastery)}</span>
                    </div>
                    <div className={styles.masteryBar} role="progressbar" aria-valuenow={t.mastery} aria-valuemin={0} aria-valuemax={100} aria-label={`${t.name} mastery: ${t.mastery}%`}>
                      <div className={styles.masteryFill} style={{ width: `${t.mastery}%` }} />
                    </div>
                    <div className={styles.topicMeta}>
                      <span>{t.sessions} sessions</span>
                      <span>Last: {t.lastStudied}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
