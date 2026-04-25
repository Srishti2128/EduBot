'use client';

/**
 * Sidebar navigation component for authenticated pages.
 * @returns The sidebar navigation JSX
 */

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { APP_NAME, NAV_LINKS } from '@/lib/constants';
import styles from './Sidebar.module.css';

/** Icon map for navigation items */
const ICON_MAP: Record<string, string> = {
  dashboard: '📊',
  learn: '🧠',
  quiz: '📝',
  progress: '📈',
  settings: '⚙️',
};

/**
 * Sidebar with navigation links and user profile.
 * @returns The sidebar component
 */
export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className={styles.sidebar} aria-label="Main navigation">
      <div className={styles.sidebarInner}>
        {/* Logo */}
        <Link href="/dashboard" className={styles.logo} aria-label={`${APP_NAME} home`}>
          <span className={styles.logoIcon} aria-hidden="true">⚡</span>
          <span className={styles.logoText}>{APP_NAME}</span>
        </Link>

        {/* Navigation */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    id={`nav-${link.icon}`}
                  >
                    <span className={styles.navIcon} aria-hidden="true">
                      {ICON_MAP[link.icon]}
                    </span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User profile */}
        {user && (
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={`${user.displayName}'s avatar`}
                  className={styles.avatar}
                  width={36}
                  height={36}
                />
              ) : (
                <div className={styles.avatarPlaceholder} aria-hidden="true">
                  {user.displayName?.charAt(0) ?? '?'}
                </div>
              )}
              <div className={styles.userName}>
                {user.displayName ?? 'User'}
              </div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={signOut}
              id="sign-out-btn"
              aria-label="Sign out"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
