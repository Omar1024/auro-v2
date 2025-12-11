"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2, XCircle, InfinityIcon, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ConfirmEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    handleEmailConfirmation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEmailConfirmation = async () => {
    try {
      const token_hash = searchParams?.get('token_hash')
      const type = searchParams?.get('type')

      if (!token_hash || type !== 'email') {
        setStatus('error')
        return
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'email',
      })

      if (error) {
        setStatus('error')
        return
      }

      setStatus('success')
      
      // Start countdown
      let count = 3
      const interval = setInterval(() => {
        count -= 1
        setCountdown(count)
        
        if (count === 0) {
          clearInterval(interval)
          router.push('/dashboard')
        }
      }, 1000)

      return () => clearInterval(interval)
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4 selection:bg-[#F7FF00] selection:text-black">
      {/* Background Blur Effects */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-[#F7FF00]/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[60vw] h-[60vw] bg-[#F7FF00]/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-[#F7FF00] flex items-center justify-center border-3 border-black shadow-[4px_4px_0px_0px_#000000]">
              <InfinityIcon className="w-8 h-8 text-black" strokeWidth={3} />
            </div>
            <h1 className="text-4xl font-bold tracking-tighter text-black">Auro</h1>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-10 border-3 border-black shadow-[8px_8px_0px_0px_#000000]">
          
          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 border-2 border-black flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-black animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-black mb-2">Confirming Email...</h2>
                <p className="text-gray-600 font-medium">Please wait while we verify your email</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#F7FF00] border-3 border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-black" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-black mb-2">Email Confirmed! 🎉</h2>
                <p className="text-gray-600 font-medium mb-6">
                  Your account is now active and ready to use
                </p>
                
                {/* Countdown */}
                <div className="inline-flex items-center gap-2 bg-[#F7FF00]/20 border-2 border-black rounded-xl px-6 py-3 mb-6">
                  <span className="text-sm font-bold text-gray-700">Redirecting in</span>
                  <span className="text-3xl font-black text-black">{countdown}</span>
                </div>
              </div>

              <Link href="/dashboard">
                <Button className="w-full bg-[#F7FF00] hover:bg-[#F7FF00]/90 text-black font-black text-lg py-6 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-red-100 border-3 border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-black mb-2">Confirmation Failed</h2>
                <p className="text-gray-600 font-medium mb-4">
                  The confirmation link is invalid or has expired
                </p>
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 text-left">
                  <p className="text-sm font-bold text-gray-700 mb-2">This could happen if:</p>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>The link has already been used</li>
                    <li>The link has expired</li>
                    <li>The link is invalid</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/auth/register">
                  <Button className="w-full bg-white hover:bg-gray-50 text-black font-bold py-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                    Try Signing Up Again
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="ghost" className="w-full font-bold">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}