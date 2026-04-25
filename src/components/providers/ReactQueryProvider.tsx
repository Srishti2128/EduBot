'use client';

/**
 * React Query Client Provider.
 * Wraps the application to provide the QueryClient instance.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

/** Props for ReactQueryProvider component */
interface ReactQueryProviderProps {
  children: ReactNode;
}

/**
 * Provides the React Query client to the component tree.
 * @param props - Component props
 * @param props.children - Child components to wrap
 * @returns The provider wrapper
 */
export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, /* 1 minute */
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
