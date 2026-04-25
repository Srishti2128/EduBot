'use client';

/**
 * Custom hook for managing chat state and streaming responses.
 */

import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, MessageMetadata, LearningMode } from '@/types';
import { generateId } from '@/lib/utils';

/** Chat hook return type */
interface UseChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  lastSignal: MessageMetadata | null;
  sendMessage: (content: string, topicId: string, mode: LearningMode) => Promise<void>;
  clearMessages: () => void;
}

/**
 * Hook for managing AI chat interactions with SSE streaming.
 * @returns Chat state and methods
 */
export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSignal, setLastSignal] = useState<MessageMetadata | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (
    content: string,
    topicId: string,
    mode: LearningMode
  ) => {
    setError(null);

    /* Add user message */
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsStreaming(true);

    /* Create assistant message placeholder */
    const assistantId = generateId();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setMessages([...updatedMessages, assistantMessage]);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          topicId,
          mode,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (response.status === 429) {
        setError('Rate limit exceeded. Please wait a moment.');
        setIsStreaming(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error?.message ?? 'Failed to get response');
        setIsStreaming(false);
        return;
      }

      /* Read SSE stream */
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n\n').filter(Boolean);

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = JSON.parse(line.slice(6));

            if (data.type === 'text') {
              accumulatedContent += data.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: accumulatedContent } : m
                )
              );
            } else if (data.type === 'signal') {
              const signal: MessageMetadata = {
                confusionScore: data.content.confusion_score ?? 0,
                topicMastery: data.content.topic_mastery ?? 0,
                suggestedAction: data.content.suggested_action ?? 'continue',
                relatedConcepts: data.content.related_concepts ?? [],
              };
              setLastSignal(signal);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, metadata: signal } : m
                )
              );
            } else if (data.type === 'error') {
              setError(data.content);
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastSignal(null);
    setError(null);
  }, []);

  return { messages, isStreaming, error, lastSignal, sendMessage, clearMessages };
}
