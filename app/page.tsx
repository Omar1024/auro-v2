"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Layers, Link2, EyeOff, Shield, Plus, Share2, Gavel, Bug, Code, MessageSquare, Infinity as InfinityIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"

export default function LandingPage() {
  const { user } = useAuth()
  const [username, setUsername] = useState("")
  const [activeCard, setActiveCard] = useState(0)
  
  const mobileCards = [
    {
      icon: Shield,
      badge: "Protected",
      title: "Platform Moderation",
      description: "We filter harmful content automatically, keeping your inboxes clean.",
      bgColor: "bg-white",
      iconBg: "bg-black",
      iconColor: "text-[#F7FF00]"
    },
    {
      icon: Share2,
      badge: "Share",
      title: "Easy Sharing",
      description: "Unique links per inbox",
      bgColor: "bg-[#F7FF00]",
      iconBg: "bg-black",
      iconColor: "text-[#F7FF00]"
    },
    {
      icon: Layers,
      badge: "Free",
      title: "3 Free Inboxes",
      description: "Create up to 3 inboxes with separate content",
      bgColor: "bg-white",
      iconBg: "bg-black",
      iconColor: "text-[#F7FF00]"
    }
  ]

  return (
    <div className="min-h-screen bg-[#FDFDF8] text-black font-sans antialiased overflow-x-hidden selection:bg-[#F7FF00] selection:text-black">
      {/* Background Blur Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-[#F7FF00]/10 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] bg-[#F7FF00]/5 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#F7FF00] flex items-center justify-center border-2 border-black">
            <InfinityIcon className="w-6 h-6 text-black" strokeWidth={3} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-black">Auro</span>
        </div>
        <Link href={user ? "/dashboard" : "/auth/login"}>
          <button className="text-sm font-bold border-2 border-black hover:bg-black hover:text-white px-4 py-2 rounded-full transition-colors">
            {user ? "Dashboard" : "Login"}
          </button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 md:px-8 py-12 lg:py-20 w-full max-w-7xl mx-auto mb-20 lg:mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 w-full items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 flex flex-col gap-8 text-left relative">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-[#F7FF00] border border-black" />
              <span className="text-xs font-bold uppercase tracking-widest text-black">
                Anonymous Platform
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-black">
              Create{" "}
              <span className="relative inline-block px-2 text-black">
                <span className="absolute inset-0 bg-[#F7FF00] -rotate-1 rounded-lg" />
                <span className="relative">Multiple</span>
              </span>
              <br />
              Anonymous
              <br />
              Inboxes.
            </h1>
            <p className="text-lg md:text-xl font-medium max-w-md text-black/80 leading-relaxed">
              The centralized platform to manage multiple shareable inboxes. Receive anonymous messages safely with built-in moderation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href={user ? "/dashboard" : "/auth/register"}>
                <button className="flex items-center justify-center h-14 px-8 bg-black text-white text-lg font-bold rounded-full hover:scale-105 transition-transform shadow-none hover:shadow-lg">
                  Start Anonymously
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </Link>
            </div>
            <div className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-black" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-black" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 border-2 border-black" />
              </div>
              <p className="text-sm font-bold text-black">Joined by 10,000+ users</p>
            </div>
          </div>

          {/* Right Visual */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center">
            {/* Mobile View - Interactive Cards with Indicators */}
            <div className="lg:hidden w-full">
              <div className="relative h-[450px] flex items-center justify-center">
                {mobileCards.map((card, index) => {
                  const Icon = card.icon
                  return (
                    <div
                      key={index}
                      onClick={() => setActiveCard(index)}
                      className={`absolute w-[85%] max-w-[320px] h-[400px] rounded-[2rem] p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 cursor-pointer ${card.bgColor} ${
                        index === activeCard
                          ? 'z-30 scale-100 opacity-100 rotate-0'
                          : index === (activeCard + 1) % mobileCards.length
                          ? 'z-20 scale-95 opacity-60 translate-x-8 rotate-3'
                          : 'z-10 scale-90 opacity-30 -translate-x-8 -rotate-3'
                      }`}
                    >
                      <div className="flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                          <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center ${card.iconColor}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="px-3 py-1 rounded-full bg-[#F7FF00] text-xs font-bold uppercase tracking-wider text-black border border-black">
                            {card.badge}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold leading-tight text-black mb-3">
                            {card.title}
                          </h3>
                          <p className="text-sm font-medium text-black/70">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Card Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {mobileCards.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveCard(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === activeCard ? 'w-8 bg-black' : 'w-2 bg-black/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop View - 2x2 Grid Layout */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-4 w-full">
              {/* Card 1 - Platform Moderation */}
              <div className="rounded-[2rem] p-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:scale-[1.02] transition-transform duration-300 border-2 border-black min-h-[280px]">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center text-[#F7FF00]">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-[#F7FF00] text-xs font-bold uppercase tracking-wider text-black border border-black">
                    Protected
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold leading-tight text-black mb-2">
                    Platform Moderation
                  </h3>
                  <p className="text-sm font-medium text-black/60">
                    We filter harmful content automatically, keeping your inboxes clean.
                  </p>
                </div>
              </div>

              {/* Card 2 - Easy Sharing */}
              <div className="bg-[#F7FF00] rounded-[2rem] p-6 flex flex-col justify-between border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group min-h-[280px]">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Share2 className="w-24 h-24 text-black" />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center text-[#F7FF00]">
                    <Share2 className="w-7 h-7" />
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-white text-xs font-bold uppercase tracking-wider text-black border border-black">
                    Share
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-black mb-2">Easy Sharing</h3>
                  <p className="text-sm font-semibold text-black/70">
                    Unique links per inbox
                  </p>
                </div>
              </div>

              {/* Card 3 - Multiple Inboxes */}
              <div className="bg-white rounded-[2rem] p-6 flex flex-col justify-between border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group min-h-[280px]">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Layers className="w-24 h-24 text-black" />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center text-[#F7FF00]">
                    <Layers className="w-7 h-7" />
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-[#F7FF00] text-xs font-bold uppercase tracking-wider text-black border border-black">
                    Free
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-black mb-2">3 Free Inboxes</h3>
                  <p className="text-sm font-semibold text-black/60">
                    Create up to 3 inboxes with separate content
                  </p>
                </div>
              </div>

              {/* Card 4 - Anonymous Messages */}
              <div className="bg-black text-white rounded-[2rem] p-6 flex flex-col justify-between border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group min-h-[280px]">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <EyeOff className="w-24 h-24 text-white" />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-[#F7FF00] flex items-center justify-center text-black">
                    <EyeOff className="w-7 h-7" />
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-[#F7FF00] text-xs font-bold uppercase tracking-wider text-black border border-[#F7FF00]">
                    Anonymous
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2">100% Anonymous</h3>
                  <p className="text-sm font-semibold text-white/70">
                    Complete privacy guaranteed for all messages
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Bar */}
      <section className="relative z-20 w-full py-12 border-y-2 border-black bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16">
          <div className="flex items-center gap-3 opacity-100 cursor-default group">
            <Layers className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm uppercase tracking-wide text-black">Multiple Inboxes</span>
          </div>
          <div className="flex items-center gap-3 opacity-100 cursor-default group">
            <Link2 className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm uppercase tracking-wide text-black">Shareable Links</span>
          </div>
          <div className="flex items-center gap-3 opacity-100 cursor-default group">
            <EyeOff className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm uppercase tracking-wide text-black">Anonymous Msgs</span>
          </div>
          <div className="flex items-center gap-3 opacity-100 cursor-default group">
            <Shield className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm uppercase tracking-wide text-black">Moderated</span>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="relative z-10 py-20 px-4 md:px-8 max-w-7xl mx-auto w-full" id="about">
        <div className="flex flex-col gap-4 text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-black">
            The Anonymous Catalyst
          </h2>
          <p className="text-lg font-medium text-black/60">
            Unified management for all your anonymous communications.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl md:col-span-2 group bg-white border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="w-14 h-14 rounded-full bg-[#F7FF00] flex items-center justify-center text-black border border-black">
                <Plus className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-black">Create Multiple Inboxes</h3>
                <p className="font-medium text-black/60 max-w-md">
                  Need feedback on a project? A confession box for your blog? A Q&A for your team? Create a dedicated inbox for each purpose and manage them all here.
                </p>
              </div>
            </div>
          </div>
          <div className="p-8 rounded-3xl flex flex-col justify-center items-center text-center gap-4 bg-black text-white border-2 border-black hover:scale-[1.02] transition-transform duration-300">
            <div className="w-20 h-20 rounded-full bg-gray-800 border-4 border-[#F7FF00] flex items-center justify-center mb-2 text-[#F7FF00]">
              <Shield className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold">Smart Safety</h3>
            <p className="text-sm font-medium opacity-80">
              Our advanced moderation filters out abuse, hate speech, and spam so you only see what matters.
            </p>
          </div>
          <div className="bg-[#F7FF00] p-8 rounded-3xl flex flex-col justify-end min-h-[240px] relative overflow-hidden group border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
              <Share2 className="w-36 h-36 text-black" />
            </div>
            <h3 className="text-2xl font-bold mb-2 relative z-10 text-black">Share Instantly</h3>
            <p className="font-medium text-black/70 relative z-10">
              Generate a unique link for each inbox. Share it on social media, Slack, or privately with ease.
            </p>
          </div>
          <div className="p-8 rounded-3xl md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-black bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div>
              <h3 className="text-2xl font-bold text-black">Ready to start?</h3>
              <p className="font-medium text-black/60">
                Claim your username and create your first anonymous inbox.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                className="bg-gray-100 border-2 border-transparent focus:border-black rounded-full px-6 py-3 w-full md:w-64 focus:ring-0 placeholder:text-gray-400 font-bold outline-none"
                placeholder="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Link href={username ? `/auth/register?username=${username}` : "/auth/register"}>
                <button className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center shrink-0 hover:scale-110 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t-2 border-black mt-auto bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F7FF00] border border-black rounded-lg flex items-center justify-center">
              <InfinityIcon className="w-5 h-5 text-black" strokeWidth={3} />
            </div>
            <span className="font-bold text-xl tracking-tight text-black">Auro</span>
          </div>
          <div className="flex gap-6">
            <a className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors text-black" href="#">
              <Bug className="w-5 h-5" />
            </a>
            <a className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors text-black" href="#">
              <Code className="w-5 h-5" />
            </a>
            <a className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors text-black" href="#">
              <MessageSquare className="w-5 h-5" />
            </a>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs opacity-60 uppercase tracking-widest mb-1 text-black">
              Encrypted by design
            </p>
            <p className="font-mono text-sm font-bold text-black">Powered by Stitch</p>
          </div>
        </div>
        <div className="text-center py-4 text-xs font-bold opacity-40 border-t border-black/5 text-black">
          © 2023 Auro Inc. All systems operational.
        </div>
      </footer>
    </div>
  )
}
