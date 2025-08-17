import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

const protectedRoutes = [
  '/dashboard',
  '/characters/create',
  '/profile',
  '/chat'
]

const authRoutes = [
  '/auth/login',
  '/auth/register'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // If it's a protected route and no token exists, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If token exists, verify it
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET)
      
      // If user is authenticated and trying to access auth routes, redirect to dashboard
      if (isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      // Token is invalid, clear it and redirect to login if accessing protected route
      const response = isProtectedRoute 
        ? NextResponse.redirect(new URL('/auth/login', request.url))
        : NextResponse.next()
      
      response.cookies.delete('auth-token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}