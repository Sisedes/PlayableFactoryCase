import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const protectedRoutes = ['/my-account', '/wishlist'];
  
  const publicRoutes = ['/signin', '/signup', '/'];
  
  const { pathname } = request.nextUrl;
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    const authToken = request.cookies.get('token')?.value || 
                     request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!authToken) {
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('returnTo', pathname);
      
      const response = NextResponse.redirect(signInUrl);
      
      response.cookies.delete('token');
      response.cookies.delete('authUser');
      
      return response;
    }
  }

  const response = NextResponse.next();
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

export const config = {
  matcher: [

    '/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
}; 