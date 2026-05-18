import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC = ['/', '/api/auth/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (PUBLIC.some(p => pathname === p)) return NextResponse.next()

  const token = request.cookies.get('auth_token')?.value
  if (!token) return NextResponse.redirect(new URL('/', request.url))

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback')
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
