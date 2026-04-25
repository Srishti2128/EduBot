'use client';

/**
 * Learn page — AI-powered learning interface with 3 modes.
 * Guided, Explorer, and Quiz modes with streaming chat.
 */

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { useChat } from '@/hooks/useChat';
import { LEARNING_MODE_LABELS, LEARNING_MODE_DESCRIPTIONS } from '@/lib/constants';
import { trackLessonStarted, trackModeSwitched, trackConfusionDetected } from '@/lib/analytics';
import type { LearningMode } from '@/types';
import styles from './learn.module.css';

/**
 * Learn page with mode selector, chat interface, and AI interaction.
 * @returns The learn page JSX
 */
export default function LearnPage() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get('mode') as LearningMode) ?? 'explorer';

  const [mode, setMode] = useState<LearningMode>(initialMode);
  const [topic, setTopic] = useState('');
  const [topicId, setTopicId] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isStarted, setIsStarted] = useState(false);

  const { messages, isStreaming, error, lastSignal, sendMessage, clearMessages } = useChat();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /** Auto-scroll to latest message */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /** Track confusion events */
  useEffect(() => {
    if (lastSignal && lastSignal.confusionScore > 0.6 && topic) {
      trackConfusionDetected(topic, lastSignal.confusionScore);
    }
  }, [lastSignal, topic]);

  /**
   * Handles mode switching.
   * @param newMode - The mode to switch to
   */
  function handleModeChange(newMode: LearningMode): void {
    if (newMode !== mode) {
      trackModeSwitched(mode, newMode);
      setMode(newMode);
    }
  }

  /**
   * Starts a learning session with the specified topic.
   * @param e - Form submit event
   */
  function handleStartSession(e: FormEvent): void {
    e.preventDefault();
    if (!topic.trim()) return;

    const newTopicId = `topic-${Date.now()}`;
    setTopicId(newTopicId);
    setIsStarted(true);
    clearMessages();
    trackLessonStarted(topic, mode);

    /* Send initial context message */
    const initialPrompt = mode === 'guided'
      ? `I want to learn about "${topic}". Please start a structured lesson from the basics.`
      : mode === 'quiz'
      ? `I want to be quizzed on "${topic}". Start with a question.`
      : `I want to learn about "${topic}". Let's start exploring!`;

    sendMessage(initialPrompt, newTopicId, mode);
  }

  /**
   * Sends a chat message.
   * @param e - Form submit event
   */
  function handleSendMessage(e: FormEvent): void {
    e.preventDefault();
    if (!inputValue.trim() || isStreaming) return;
    sendMessage(inputValue.trim(), topicId, mode);
    setInputValue('');
    inputRef.current?.focus();
  }

  /** Handles Enter key in textarea */
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as FormEvent);
    }
  }

  const modes: LearningMode[] = ['guided', 'explorer', 'quiz'];
  const modeIcons: Record<LearningMode, string> = { guided: '📚', explorer: '🔍', quiz: '📝' };

  return (
    <div className="page-container">
      <Sidebar />
      <main id="main-content" className="main-content">
        <div className={styles.learnContainer}>
          {/* Mode selector */}
          <div className={styles.topBar}>
            <div
              className={styles.modeSelector}
              role="radiogroup"
              aria-label="Select learning mode"
            >
              {modes.map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={mode === m}
                  className={`${styles.modeBtn} ${mode === m ? styles.modeBtnActive : ''}`}
                  onClick={() => handleModeChange(m)}
                  id={`mode-${m}`}
                >
                  <span aria-hidden="true">{modeIcons[m]}</span>
                  <span>{LEARNING_MODE_LABELS[m]}</span>
                </button>
              ))}
            </div>

            {/* Confusion indicator */}
            {lastSignal && (
              <div
                className={styles.signalIndicator}
                aria-label={`AI confidence: ${Math.round((1 - lastSignal.confusionScore) * 100)}%`}
                title={`Confusion: ${Math.round(lastSignal.confusionScore * 100)}% | Mastery: ${lastSignal.topicMastery}%`}
              >
                <div
                  className={styles.signalBar}
                  style={{
                    width: `${lastSignal.topicMastery}%`,
                    background: lastSignal.confusionScore > 0.6
                      ? 'var(--color-error)'
                      : lastSignal.confusionScore > 0.3
                      ? 'var(--color-warning)'
                      : 'var(--color-success)',
                  }}
                />
              </div>
            )}
          </div>

          {!isStarted ? (
            /* Topic entry */
            <div className={styles.startScreen}>
              <div className={styles.startContent}>
                <span className={styles.startIcon} aria-hidden="true">{modeIcons[mode]}</span>
                <h1>{LEARNING_MODE_LABELS[mode]}</h1>
                <p className={styles.modeDesc}>{LEARNING_MODE_DESCRIPTIONS[mode]}</p>
                <form onSubmit={handleStartSession} className={styles.topicForm}>
                  <label htmlFor="topic-input" className={styles.topicLabel}>
                    What would you like to learn?
                  </label>
                  <input
                    id="topic-input"
                    type="text"
                    className="input"
                    placeholder="e.g., Quantum Computing, Machine Learning, React Hooks..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                    aria-describedby="topic-hint"
                  />
                  <p id="topic-hint" className={styles.topicHint}>
                    Enter any topic you want to explore
                  </p>
                  <button type="submit" className="btn btn-primary btn-lg" id="start-session-btn">
                    Start Learning
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Chat interface */
            <div className={styles.chatArea}>
              {/* Messages */}
              <div
                className={styles.messageList}
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
                  >
                    <div className={styles.messageBubble}>
                      <span className="sr-only">{msg.role === 'user' ? 'You' : 'MindPath'}:</span>
                      <div className={styles.messageContent}>
                        {msg.content || (
                          <span className={styles.typingIndicator} aria-label="MindPath is thinking">
                            <span />
                            <span />
                            <span />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Error display */}
              {error && (
                <div className={styles.errorBanner} role="alert">
                  <span aria-hidden="true">⚠️</span> {error}
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSendMessage} className={styles.inputArea}>
                <label htmlFor="chat-input" className="sr-only">
                  Type your message
                </label>
                <textarea
                  ref={inputRef}
                  id="chat-input"
                  className={styles.chatInput}
                  placeholder="Ask anything about the topic..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={isStreaming}
                  aria-describedby="input-hint"
                />
                <p id="input-hint" className="sr-only">Press Enter to send, Shift+Enter for new line</p>
                <button
                  type="submit"
                  className={`btn btn-primary btn-icon ${styles.sendBtn}`}
                  disabled={isStreaming || !inputValue.trim()}
                  id="send-message-btn"
                  aria-label="Send message"
                >
                  {isStreaming ? '⏳' : '➤'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
