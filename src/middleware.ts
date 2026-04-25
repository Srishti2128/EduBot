/**
 * Next.js Middleware for route protection.
 * Redirects unauthenticated users away from protected routes.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, PROTECTED_ROUTES } from '@/lib/constants';

/**
 * Middleware function that checks for session cookies on protected routes.
 * @param request - The incoming request
 * @returns NextResponse redirect or passthrough
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  /* Check if the current path is a protected route */
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !sessionCookie) {
    /* Redirect unauthenticated users to the landing page */
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  /* If authenticated and on landing page, redirect to dashboard */
  if (pathname === '/' && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

/** Configure which paths the middleware runs on */
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/learn/:path*',
    '/quiz/:path*',
    '/progress/:path*',
    '/settings/:path*',
  ],
};
