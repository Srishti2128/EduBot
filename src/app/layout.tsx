import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

/** Root metadata for SEO */
export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — AI-Powered Learning Companion`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: ['AI', 'learning', 'education', 'personalized', 'adaptive', 'study companion'],
};

/**
 * Root layout wrapping all pages with auth provider and skip link.
 * @param props - Layout props
 * @param props.children - Page content
 * @returns The root HTML layout
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <a href="#main-content" className="skip-link" id="skip-link">
          Skip to content
        </a>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
