// src/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isAdminPath = req.nextUrl.pathname.startsWith('/admin');
    const isAdminLoginPage = req.nextUrl.pathname === '/admin-login';
    const isAdminAPI = req.nextUrl.pathname.startsWith('/api/admin');

    // Allow auth pages
    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return null;
    }

    // Allow admin API and login page without session
    if (isAdminAPI || isAdminLoginPage) {
      return NextResponse.next();
    }

    // Require NextAuth session for all other pages
    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Check admin access: require ADMIN role AND admin password verification
    if (isAdminPath) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      // Check for admin password verification cookie
      const adminVerified = req.cookies.get('admin_verified')?.value === 'true';
      if (!adminVerified) {
        return NextResponse.redirect(new URL('/admin-login', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // We handle redirects in the middleware function
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/interview/:path*', '/admin/:path*', '/admin-login', '/auth/:path*', '/api/admin/:path*'],
};
