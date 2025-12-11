import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Extract the first segment after /
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  
  // If the first segment starts with @, it's a username route
  if (firstSegment && firstSegment.startsWith('@')) {
    // Strip the @ and rewrite to the dynamic [username] route
    const username = firstSegment.substring(1)
    const remainingPath = segments.slice(1).join('/')
    const newPath = `/${username}${remainingPath ? '/' + remainingPath : ''}`
    
    // Rewrite to the actual route structure
    return NextResponse.rewrite(new URL(newPath, request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}


