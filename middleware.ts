import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes accessible without authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  // यदि टोकन छैन भने
  if (!accessToken) {
    // र प्रयोगकर्ता पब्लिक रुटमा छैन भने - सिधै login मा पठाउने
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // यदि टोकन छ तर प्रयोगकर्ता login पेजमै छ भने
  if (isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/cms/:path*',  

  ],
};