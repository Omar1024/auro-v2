import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    // Try to get the real IP from various headers (proxy-aware)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare
    
    // Priority: Cloudflare IP > X-Real-IP > X-Forwarded-For > fallback
    let ip = cfConnectingIp || realIp || forwardedFor?.split(',')[0].trim() || 'unknown'
    
    // For development, if IP is localhost/private, use a dev identifier
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      ip = `dev_${ip}`
    }

    // Rate limiting: 60 requests per minute
    if (!checkRateLimit(ip, 60, 60000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
    
    return NextResponse.json({ ip }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get IP address' },
      { status: 500 }
    )
  }
}












