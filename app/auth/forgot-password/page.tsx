"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Loader2, ArrowLeft, CheckCircle2, InfinityIcon, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setEmailSent(true)
      toast({
        title: "✅ Email Sent",
        description: "Check your inbox for the password reset link",
      })
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
        {/* Back Button */}
        <Link href="/auth/login" className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-black transition-colors group">
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 group-hover:border-black flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Back to Login</span>
        </Link>

        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#F7FF00] flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
              <InfinityIcon className="w-6 h-6 text-black" strokeWidth={3} />
            </div>
            <h1 className="text-4xl font-bold tracking-tighter text-black">Auro</h1>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border-3 border-black shadow-[8px_8px_0px_0px_#000000]">
          
          {!emailSent ? (
            <>
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#F7FF00] rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
                  <Mail className="w-8 h-8 text-black" />
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-black mb-2">Reset Password</h2>
                <p className="text-gray-600 font-medium">
                  Enter your email to receive a password reset link
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-black rounded-xl font-medium placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#F7FF00]/30 focus:border-black transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-[#F7FF00] hover:bg-[#F7FF00]/90 text-black font-black text-lg py-6 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#F7FF00] border-3 border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-black" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-black mb-2">Check Your Email! 📧</h2>
                <p className="text-gray-600 font-medium mb-4">
                  We've sent a password reset link to
                </p>
                <p className="text-black font-bold text-lg bg-[#F7FF00]/20 px-4 py-2 rounded-xl inline-block">
                  {email}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 text-left">
                <p className="text-sm font-bold text-gray-700 mb-2">📌 Next Steps:</p>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Check your email inbox</li>
                  <li>Click the reset link</li>
                  <li>Enter your new password</li>
                </ol>
              </div>

              <Link href="/auth/login">
                <Button className="w-full bg-white hover:bg-gray-50 text-black font-bold py-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}

        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-black font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}