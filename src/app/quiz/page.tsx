'use client';

/**
 * Quiz page — AI-generated assessments with feedback.
 */

import { useState, type FormEvent } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { trackQuizCompleted } from '@/lib/analytics';
import type { DifficultyLevel } from '@/types';
import styles from './quiz.module.css';

/** Quiz question from API */
interface QuizQuestion {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

/**
 * Quiz page with topic selection, questions, and results.
 * @returns The quiz page JSX
 */
export default function QuizPage() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'setup' | 'quiz' | 'results'>('setup');

  /** Generates quiz questions from the API */
  async function handleGenerateQuiz(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: `quiz-${Date.now()}`,
          topicName: topic,
          difficulty,
          questionCount: 5,
          questionTypes: ['mcq', 'true_false'],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message ?? 'Failed to generate quiz');
      }

      const data = await response.json();
      setQuestions(data.data.questions);
      setAnswers({});
      setCurrentStep('quiz');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  /** Submits answers for evaluation */
  async function handleSubmitQuiz(): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/quiz/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: `quiz-${Date.now()}`,
          topicId: `topic-${Date.now()}`,
          answers: Object.entries(answers).map(([questionId, userAnswer]) => ({
            questionId,
            userAnswer,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to evaluate quiz');

      const data = await response.json();
      setResults(data.data);
      setCurrentStep('results');
      trackQuizCompleted(topic, data.data.score ?? 0, questions.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <Sidebar />
      <main id="main-content" className="main-content">
        <div className="content-area">
          <h1>Quiz Mode</h1>
          <p className={styles.subtitle}>Test your knowledge with AI-generated assessments</p>

          {error && (
            <div className={styles.error} role="alert">
              <span aria-hidden="true">⚠️</span> {error}
            </div>
          )}

          {currentStep === 'setup' && (
            <form onSubmit={handleGenerateQuiz} className={styles.setupForm}>
              <div className={styles.formGroup}>
                <label htmlFor="quiz-topic" className={styles.label}>Topic</label>
                <input
                  id="quiz-topic"
                  type="text"
                  className="input"
                  placeholder="e.g., JavaScript Promises"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  aria-describedby="quiz-topic-hint"
                />
                <p id="quiz-topic-hint" className={styles.hint}>Enter the topic you want to be quizzed on</p>
              </div>

              <fieldset className={styles.formGroup}>
                <legend className={styles.label}>Difficulty</legend>
                <div className={styles.difficultyGroup} role="radiogroup">
                  {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((d) => (
                    <label key={d} className={`${styles.difficultyOption} ${difficulty === d ? styles.difficultyActive : ''}`}>
                      <input
                        type="radio"
                        name="difficulty"
                        value={d}
                        checked={difficulty === d}
                        onChange={() => setDifficulty(d)}
                        className="sr-only"
                      />
                      <span>{d.charAt(0).toUpperCase() + d.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="generate-quiz-btn">
                {loading ? 'Generating...' : 'Generate Quiz'}
              </button>
            </form>
          )}

          {currentStep === 'quiz' && (
            <div className={styles.quizArea}>
              {questions.map((q, index) => (
                <div key={q.id} className={`glass-card ${styles.questionCard}`}>
                  <div className={styles.questionNumber}>Question {index + 1}</div>
                  <h3 className={styles.questionText}>{q.question}</h3>

                  {q.options ? (
                    <div className={styles.options} role="radiogroup" aria-label={`Options for question ${index + 1}`}>
                      {q.options.map((opt) => (
                        <label key={opt} className={`${styles.option} ${answers[q.id] === opt ? styles.optionSelected : ''}`}>
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                            className="sr-only"
                          />
                          <span className={styles.optionCircle} aria-hidden="true" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <label htmlFor={`answer-${q.id}`} className="sr-only">Your answer</label>
                      <input
                        id={`answer-${q.id}`}
                        type="text"
                        className="input"
                        placeholder="Type your answer..."
                        value={answers[q.id] ?? ''}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      />
                    </div>
                  )}
                </div>
              ))}

              <button
                className="btn btn-primary btn-lg"
                onClick={handleSubmitQuiz}
                disabled={loading || Object.keys(answers).length < questions.length}
                id="submit-quiz-btn"
              >
                {loading ? 'Evaluating...' : 'Submit Answers'}
              </button>
            </div>
          )}

          {currentStep === 'results' && results && (
            <div className={styles.resultsArea}>
              <div className={`glass-card ${styles.scoreCard}`}>
                <div className={styles.scoreCircle}>
                  <span className={styles.scoreValue}>{String(results.score ?? 0)}%</span>
                </div>
                <h2>Quiz Complete!</h2>
                <p>{String(results.feedback ?? 'Great effort!')}</p>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => { setCurrentStep('setup'); setQuestions([]); setResults(null); setAnswers({}); }}
                id="retake-quiz-btn"
              >
                Take Another Quiz
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
