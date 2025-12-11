/**
 * Site Configuration
 * Centralized configuration for site URLs and settings
 */

// Production URL
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://auro.obl.ee'

// Helper function to get the full URL for a path
export function getSiteUrl(path: string = ''): string {
  // Always use the configured site URL (production)
  const url = SITE_URL
  
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  return cleanPath ? `${url}/${cleanPath}` : url
}

