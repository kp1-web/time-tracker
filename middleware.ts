import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register']
  const isPublicPath = publicPaths.includes(pathname)

  // Allow logout without authentication
  if (pathname === '/api/auth/logout') {
    return NextResponse.next()
  }

  // Redirect to login if trying to access protected route without session
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if trying to access login/register with session
  if (session && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 