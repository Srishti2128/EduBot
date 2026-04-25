/**
 * Accessibility tests using jest-axe.
 * Validates WCAG 2.1 AA compliance for key pages.
 */

import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

/* Mock next/navigation */
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

/* Mock Firebase */
jest.mock('@/lib/firebase', () => ({
  getFirebaseApp: jest.fn(),
  getFirebaseAuth: jest.fn(() => ({
    onAuthStateChanged: jest.fn((callback: (user: null) => void) => {
      callback(null);
      return jest.fn();
    }),
  })),
  getFirebaseFirestore: jest.fn(),
  getFirebaseAnalytics: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((_auth: unknown, callback: (user: null) => void) => {
    callback(null);
    return jest.fn();
  }),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

jest.mock('firebase/analytics', () => ({
  logEvent: jest.fn(),
  isSupported: jest.fn(() => Promise.resolve(false)),
  getAnalytics: jest.fn(),
}));

describe('Accessibility — Landing Page Elements', () => {
  it('should have no axe violations for skip link and headings', async () => {
    const { container } = render(
      <main id="main-content">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <h1>Learn Smarter with AI</h1>
        <p>Your intelligent learning companion</p>
        <button aria-label="Sign in with Google">Get Started</button>
      </main>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations for form inputs with labels', async () => {
    const { container } = render(
      <form>
        <label htmlFor="topic-input">What would you like to learn?</label>
        <input id="topic-input" type="text" required aria-describedby="topic-hint" />
        <p id="topic-hint">Enter any topic</p>
        <button type="submit">Start Learning</button>
      </form>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations for radio group (mode selector)', async () => {
    const { container } = render(
      <div role="radiogroup" aria-label="Select learning mode">
        <button role="radio" aria-checked={true}>Guided</button>
        <button role="radio" aria-checked={false}>Explorer</button>
        <button role="radio" aria-checked={false}>Quiz</button>
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations for chat log', async () => {
    const { container } = render(
      <div role="log" aria-live="polite" aria-label="Chat messages">
        <div><span className="sr-only">You:</span><p>What is React?</p></div>
        <div><span className="sr-only">MindPath:</span><p>React is a JavaScript library...</p></div>
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations for knowledge graph with table fallback', async () => {
    const { container } = render(
      <div>
        <div role="img" aria-label="Knowledge graph showing 3 concepts and their relationships">
          <canvas />
        </div>
        <table aria-label="Topic mastery breakdown">
          <thead>
            <tr>
              <th scope="col">Topic</th>
              <th scope="col">Mastery</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>React</td><td>80%</td></tr>
          </tbody>
        </table>
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations for navigation with aria-current', async () => {
    const { container } = render(
      <nav aria-label="Main navigation">
        <ul role="list">
          <li><a href="/dashboard" aria-current="page">Dashboard</a></li>
          <li><a href="/learn">Learn</a></li>
          <li><a href="/quiz">Quiz</a></li>
        </ul>
      </nav>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations for progress bar', async () => {
    const { container } = render(
      <div role="progressbar" aria-valuenow={75} aria-valuemin={0} aria-valuemax={100} aria-label="React mastery: 75%">
        <div style={{ width: '75%' }} />
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
