import { NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/app',
  '/hub/organization',
  '/hub/settings'
];

// Routes that are always public
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/privacy',
  '/terms',
  '/data-deletion'
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if the route needs protection
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    // Check for auth token in cookies
    const token = request.cookies.get('auth_token');
    
    if (!token) {
      // Redirect to login with return URL
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    
    // TODO: Verify token validity
    // For now, we just check if it exists
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};