"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowRight, Key, Mail, Lock, Eye, EyeOff, ShieldCheck, InfinityIcon, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/auth"

export default function LoginPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [emailOrUsername, setEmailOrUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signIn(emailOrUsername, password)

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username/email or password",
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
        <Link href="/" className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-black transition-colors group">
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 group-hover:border-black flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Back</span>
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-full bg-[#F7FF00] flex items-center justify-center border-2 border-black group-hover:scale-110 transition-transform">
              <InfinityIcon className="w-6 h-6 text-black" strokeWidth={3} />
            </div>
            <h1 className="text-4xl font-bold tracking-tighter text-black">Auro</h1>
          </Link>
          <p className="text-gray-600 text-sm tracking-wide uppercase font-medium mt-2">
            Anonymous Q&A Platform
          </p>
        </div>

        {/* Glass Panel */}
        <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-8 sm:p-10 w-full shadow-2xl border border-white/50 relative overflow-hidden">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-white/50">
              <Key className="w-8 h-8 text-black" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-black">Verify Identity</h2>
            <p className="text-gray-600 text-sm mt-1">Enter credentials to sign in</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            {/* Email/Username Input */}
            <div className="group">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1 pl-1">
                Alias / Email
              </label>
              <div className="relative flex items-center pb-1 border-b-2 border-gray-300 focus-within:border-black transition-colors">
                <Mail className="absolute left-0 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  className="w-full bg-transparent border-none p-2 pl-8 text-lg font-medium text-black placeholder:text-gray-300 focus:ring-0 focus:outline-none"
                  placeholder="user@auro.app"
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group mt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1 pl-1">
                Password
              </label>
              <div className="relative flex items-center pb-1 border-b-2 border-gray-300 focus-within:border-black transition-colors">
                <Lock className="absolute left-0 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  className="w-full bg-transparent border-none p-2 pl-8 pr-10 text-lg font-medium text-black placeholder:text-gray-300 focus:ring-0 focus:outline-none tracking-widest"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  className="text-gray-400 hover:text-black transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button and Links */}
            <div className="mt-8 flex flex-col gap-4">
              <button
                className="w-full h-14 bg-[#F7FF00] hover:bg-[#e6e205] text-black font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="flex justify-between items-center text-sm px-2 pt-2 flex-wrap gap-2">
                <Link
                  className="text-gray-600 hover:text-black transition-colors font-medium"
                  href="/auth/forgot-password"
                >
                  Forgot Password?
                </Link>
                <Link
                  className="text-gray-600 hover:text-black transition-colors font-medium"
                  href="/auth/register"
                >
                  Don't have an account? Create One
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-sm border border-white/20">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-black">Totally Anonymous</span>
          </div>
        </div>
      </div>
    </div>
  )
}
