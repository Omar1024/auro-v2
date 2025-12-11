import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Auro - Anonymous Inbox Platform',
  description: 'Create multiple anonymous inboxes. Receive messages safely with built-in moderation.',
  icons: {
    icon: [
      { url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23F7FF00"/><circle cx="50" cy="50" r="48" fill="none" stroke="%23000000" stroke-width="2"/><path d="M50 50C50 40.34 57.16 32.5 66 32.5C74.84 32.5 82 40.34 82 50C82 59.66 74.84 67.5 66 67.5C57.16 67.5 50 59.66 50 50ZM50 50C50 59.66 42.84 67.5 34 67.5C25.16 67.5 18 59.66 18 50C18 40.34 25.16 32.5 34 32.5C42.84 32.5 50 40.34 50 50Z" stroke="%23000000" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' }
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}

