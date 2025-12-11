"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Frown } from "lucide-react"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-white transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center px-4 py-3 justify-between z-20">
        <button 
          onClick={() => router.back()}
          className="group flex w-10 h-10 items-center justify-center rounded-full hover:bg-black/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F2CC0D]/50"
        >
          <ArrowLeft className="w-6 h-6 text-[#18181B] transition-transform group-hover:-translate-x-0.5" />
        </button>
        <div className="w-10 h-10"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 w-full max-w-md mx-auto pb-20">
        {/* 404 Number with Glow */}
        <div className="relative flex flex-col items-center justify-center mb-10 w-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#F2CC0D]/10 rounded-full blur-[60px]"></div>
          <h1 
            className="relative text-[160px] leading-[0.8] font-black tracking-tighter text-[#F2CC0D] select-none"
            style={{ textShadow: '0 0 30px rgba(242, 204, 13, 0.4)' }}
          >
            404
          </h1>
          <div className="absolute -bottom-4 right-8 bg-white border-4 border-white rounded-full p-2 rotate-12 shadow-lg ring-1 ring-black/5">
            <Frown className="w-10 h-10 text-[#F2CC0D]" strokeWidth={2} />
          </div>
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-center gap-3 text-center mb-12">
          <h2 className="text-[#18181B] text-2xl font-bold leading-tight tracking-tight">
            Lost in the void?
          </h2>
          <p className="text-[#71717A] text-base font-normal leading-relaxed max-w-[280px]">
            We couldn't find the page you're looking for. It might have been deleted or the link is incorrect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <Link href="/dashboard">
            <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-6 bg-[#F2CC0D] hover:bg-[#D9B70B] active:scale-[0.98] transition-all duration-200 text-white text-base font-bold leading-normal tracking-wide shadow-[0_8px_20px_-6px_rgba(242,204,13,0.4)]">
              <span>Return to Dashboard</span>
            </button>
          </Link>
          <Link href="/">
            <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-transparent hover:bg-black/5 active:scale-[0.98] transition-all text-[#71717A] hover:text-[#18181B] text-sm font-semibold leading-normal">
              <span>Go to Homepage</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Dot Pattern Background */}
      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(#E4E4E7 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  )
}


