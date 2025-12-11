"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Logo } from "@/components/logo"

export const dynamic = 'force-dynamic'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Confirming your email...')

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Skip if running on server
        if (typeof window === 'undefined') return
        
        // Get the hash from URL (contains the tokens)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')


        if (type === 'recovery') {
          // Password reset flow
          setMessage('Redirecting to password reset...')
          router.push('/auth/reset-password')
          return
        }

        if (accessToken && refreshToken) {
          // Set the session
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) throw error

          // Get the user
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user) {
            // Check if user profile exists
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single()

            // If profile doesn't exist, create it
            if (!profile && user.user_metadata?.username) {
              await supabase
                .from('users')
                .insert([
                  {
                    id: user.id,
                    username: user.user_metadata.username,
                    email: user.email,
                    role: 'user',
                  },
                ])
            }

            setStatus('success')
            setMessage('Email confirmed! Redirecting to dashboard...')
            
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          }
        } else {
          throw new Error('No tokens found in URL')
        }
      } catch (error: any) {
        console.error('Email confirmation error:', error)
        setStatus('error')
        setMessage(error.message || 'Failed to confirm email. Please try again.')
      }
    }

    handleEmailConfirmation()
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-effect shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <Logo 
                  size="lg"
                  iconClassName="text-primary"
                  textClassName="gradient-text"
                />
              </motion.div>
            </div>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            {status === 'loading' && (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-semibold text-green-600 mb-2">Success!</h3>
                  <p className="text-muted-foreground">{message}</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <XCircle className="h-12 w-12 text-destructive mx-auto" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-semibold text-destructive mb-2">Oops!</h3>
                  <p className="text-muted-foreground mb-4">{message}</p>
                  <div className="flex flex-col gap-2">
                    <Link href="/auth/login">
                      <Button className="w-full gradient-button">
                        Go to Login
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button variant="outline" className="w-full">
                        Create New Account
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </main>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </main>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
