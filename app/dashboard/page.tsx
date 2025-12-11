"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MobileInboxCard } from "@/components/mobile-inbox-card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, TrendingUp, MessageCircle, Inbox as InboxIcon, Loader2, Clock, ArrowRight, User, Reply, Eye, EyeOff, Send, Home, BarChart3, Settings, X, MoreHorizontal, Info, Globe, Lock, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newInboxName, setNewInboxName] = useState("")
  const [newInboxPrompt, setNewInboxPrompt] = useState("")
  const [newInboxLink, setNewInboxLink] = useState("")
  const [isPublicInbox, setIsPublicInbox] = useState(true)
  const [inboxPassword, setInboxPassword] = useState("")
  const [isLinkAvailable, setIsLinkAvailable] = useState(true)
  const [inboxes, setInboxes] = useState<any[]>([])
  const [allMessages, setAllMessages] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalInboxes: 0,
    totalMessages: 0,
    repliedMessages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingInbox, setIsCreatingInbox] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isPublicReply, setIsPublicReply] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchInboxes()
      fetchAllMessages()

      const inboxesChannel = supabase
        .channel('user_inboxes_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'inboxes', filter: `user_id=eq.${user.id}` },
          () => {
            fetchInboxes()
          }
        )
        .subscribe()

      const messagesChannel = supabase
        .channel('user_messages_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'messages' },
          () => {
            fetchInboxes()
            fetchAllMessages()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(inboxesChannel)
        supabase.removeChannel(messagesChannel)
      }
    }
  }, [user])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchInboxes()
        fetchAllMessages()
      }
    }

    const handleFocus = () => {
      if (user) {
        fetchInboxes()
        fetchAllMessages()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user])

  useEffect(() => {
    if (!isCreateDialogOpen) {
      setIsLinkAvailable(true)
      setNewInboxLink("")
      setNewInboxName("")
      setNewInboxPrompt("")
      setIsPublicInbox(true)
    }
  }, [isCreateDialogOpen])

  useEffect(() => {
    const checkLinkAvailability = async () => {
      if (!newInboxLink.trim() || !user) {
        setIsLinkAvailable(true)
        return
      }

      try {
        const { data, error } = await supabase
          .from('inboxes')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', newInboxLink.trim())
          .maybeSingle()

        if (error) throw error
        setIsLinkAvailable(!data)
      } catch (error) {
        setIsLinkAvailable(true)
      }
    }

    const debounceTimer = setTimeout(checkLinkAvailability, 300)
    return () => clearTimeout(debounceTimer)
  }, [newInboxLink, user])

  const fetchInboxes = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Fetch hidden words first
      const { data: hiddenWordsData } = await supabase
        .from('hidden_words')
        .select('word')
        .eq('user_id', user.id)
      
      const hiddenWords = (hiddenWordsData || []).map(item => item.word.toLowerCase())

      const { data: inboxesData, error: inboxesError } = await supabase
        .from('inboxes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (inboxesError) throw inboxesError

      const inboxesWithCounts = await Promise.all(
        (inboxesData || []).map(async (inbox) => {
          // Fetch unreplied messages with content
          const { data: messages } = await supabase
            .from('messages')
            .select('content')
            .eq('inbox_id', inbox.id)
            .eq('is_replied', false)

          // Filter out messages containing hidden words
          const visibleMessages = (messages || []).filter(msg => {
            const lowerContent = msg.content.toLowerCase()
            return !hiddenWords.some(word => lowerContent.includes(word))
          })

          return {
            id: inbox.id,
            name: inbox.name,
            promptText: inbox.prompt_text,
            messageCount: visibleMessages.length,
            visibility: inbox.visibility,
          }
        })
      )

      setInboxes(inboxesWithCounts)
      setStats(prev => ({ ...prev, totalInboxes: inboxesWithCounts.length }))
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load inboxes",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAllMessages = async () => {
    if (!user) return

    try {
      const { data: userInboxes } = await supabase
        .from('inboxes')
        .select('id')
        .eq('user_id', user.id)

      if (!userInboxes || userInboxes.length === 0) {
        setAllMessages([])
        setStats(prev => ({ ...prev, totalMessages: 0, repliedMessages: 0 }))
        return
      }

      const inboxIds = userInboxes.map(inbox => inbox.id)

      const { data: unrepliedMessages } = await supabase
        .from('messages')
        .select(`
          id,
          anon_id,
          content,
          created_at,
          inbox_id,
          inboxes (
            id,
            name
          )
        `)
        .in('inbox_id', inboxIds)
        .eq('is_replied', false)
        .order('created_at', { ascending: false })
        .limit(20)

      const { count: repliedCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('inbox_id', inboxIds)
        .eq('is_replied', true)

      setAllMessages(unrepliedMessages || [])
      setStats(prev => ({
        ...prev,
        totalMessages: (unrepliedMessages || []).length,
        repliedMessages: repliedCount || 0,
      }))
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load messages",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const handleReply = async (messageId: string) => {
    if (!replyText.trim()) {
      toast({
        title: "❌ Error",
        description: "Please enter a reply",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const { error: replyError } = await supabase
        .from('replies')
        .insert([
          {
            message_id: messageId,
            content: replyText,
            is_public: isPublicReply,
          },
        ])

      if (replyError) throw replyError

      const { error: updateError } = await supabase
        .from('messages')
        .update({ is_replied: true })
        .eq('id', messageId)

      if (updateError) throw updateError

      toast({
        title: "✅ Reply Sent!",
        description: isPublicReply 
          ? "Your reply is now public on your feed" 
          : "Your private reply has been sent",
      })

      setReplyingTo(null)
      setReplyText("")
      await fetchAllMessages()
      await fetchInboxes()
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to send reply",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateInbox = async () => {
    if (!user || !newInboxLink.trim() || !newInboxName.trim() || !newInboxPrompt.trim()) {
      toast({
        title: "❌ Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    // Check inbox limit (3 inboxes max)
    if (inboxes.length >= 3) {
      toast({
        title: "❌ Inbox Limit Reached",
        description: "You can only create up to 3 inboxes",
        variant: "destructive",
      })
      return
    }

    // Check if private inbox requires a password
    if (!isPublicInbox && !inboxPassword.trim()) {
      toast({
        title: "❌ Password Required",
        description: "Private inboxes require a password",
        variant: "destructive",
      })
      return
    }

    if (!isLinkAvailable) {
      toast({
        title: "❌ Error",
        description: "This inbox link is already taken. Please choose another one.",
        variant: "destructive",
      })
      return
    }

    setIsCreatingInbox(true)
    try {
      const { error } = await supabase
        .from('inboxes')
        .insert([
          {
            user_id: user.id,
            name: newInboxLink.trim(),
            prompt_text: newInboxPrompt.trim(),
            visibility: isPublicInbox ? 'public' : 'private',
            password: !isPublicInbox && inboxPassword.trim() ? inboxPassword.trim() : null,
          },
        ])

      if (error) throw error

      setIsCreateDialogOpen(false)
      setNewInboxLink("")
      setNewInboxName("")
      setNewInboxPrompt("")
      setIsPublicInbox(true)
      setInboxPassword("")
      setIsLinkAvailable(true)
      await fetchInboxes()

      toast({
        title: "✅ Inbox Created!",
        description: `Your inbox "${newInboxName}" is ready to receive messages`,
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to create inbox. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsCreatingInbox(false)
    }
  }

  const handleDeleteInbox = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inboxes')
        .delete()
        .eq('id', id)
        .select()

      if (error) throw error

      await fetchInboxes()

      toast({
        title: "✅ Inbox Deleted",
        description: "The inbox has been removed successfully",
      })
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to delete inbox",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  if (authLoading || !user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-[#FAFAFA]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#FACC15] flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-black animate-spin" />
            </div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      
      {/* MOBILE LAYOUT */}
      <main className="md:hidden min-h-screen bg-[#F8F9FA] pb-28 pt-20">
        <div className="px-5 space-y-8 mt-4">
          {/* Mobile Header */}
              <div>
            <h1 className="text-[2rem] leading-tight font-extrabold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1 text-base font-medium">
              Welcome back, <span className="text-[#FFC805] font-bold">@{profile?.username}</span>
            </p>
              </div>

          {/* Mobile Create Inbox Button */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
              <button className="group w-full bg-[#FFC805] hover:bg-[#FFD025] text-black font-bold py-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]">
                <div className="bg-black/10 rounded-full p-1 group-hover:bg-black/20 transition-colors">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-lg">Create Inbox</span>
              </button>
                </DialogTrigger>
                <DialogContent className="bg-[#FDFBF7] border-2 border-black p-0 max-w-lg max-h-[95vh] overflow-y-auto">
                  {/* Header */}
                  <div className="sticky top-0 z-50 flex items-center justify-between px-5 py-3 bg-[#FDFBF7] border-b-2 border-black">
                    <DialogClose asChild>
                      <button className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-black bg-white hover:bg-gray-50 active:translate-y-0.5 transition-all">
                        <X className="h-4 w-4 text-black" />
                      </button>
                    </DialogClose>
                    <h1 className="text-lg font-black tracking-tight uppercase text-black">New Inbox</h1>
                    <div className="w-9 h-9" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col w-full pb-5 pt-4 px-5">
                    <div className="mb-4 text-center">
                      <h2 className="text-2xl font-black leading-tight tracking-tight text-black mb-1 uppercase">Create Your Space</h2>
                      <p className="text-gray-500 font-bold text-xs">Customize your anonymous inbox details below.</p>
                    </div>

                    {/* Preview Card */}
                    <div className="mb-5 relative">
                      <div className="relative overflow-hidden rounded-2xl border-2 border-black bg-[#FFEB3B] h-40 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div 
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)',
                            backgroundSize: '20px 20px'
                          }}
                        />
                        <div className="absolute inset-0 p-4 flex flex-col justify-between h-full">
                          <div className="flex justify-between items-start z-10">
                            <div className="inline-flex items-center gap-1 bg-white border-2 border-black px-2 py-1 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              <Zap className="h-3 w-3 text-black" />
                              <span className="text-black font-black text-[10px] uppercase tracking-wide">Preview</span>
                            </div>
                            <div className="w-8 h-8 rounded-full border-2 border-black bg-white flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              <MoreHorizontal className="h-4 w-4 text-black" />
                            </div>
                          </div>
                          <div className="bg-white border-2 border-black rounded-xl p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] z-10">
                            <h3 className="text-black text-base font-black tracking-tighter mb-0.5 truncate">
                              auro.app/@{profile?.username || 'username'}/{newInboxLink || 'inbox-link'}
                            </h3>
                            <p className="text-gray-600 font-bold text-xs leading-snug line-clamp-1">
                              {newInboxPrompt || 'Send me anonymous messages!'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Form */}
                    <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); handleCreateInbox(); }}>
                      {/* Inbox Link */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between pl-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-black">Inbox Link</label>
                          <span className={`px-2 py-0.5 rounded-full border-2 border-black text-[9px] font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider ${
                            isLinkAvailable 
                              ? 'bg-[#CAFFBF] text-black' 
                              : 'bg-red-400 text-white'
                          }`}>
                            {isLinkAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        <div className="flex items-center bg-white rounded-xl border-2 border-black overflow-hidden h-11 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          <div className="pl-3 pr-2 flex items-center justify-center h-full select-none bg-gray-100 border-r-2 border-black">
                            <span className="text-gray-400 font-bold text-xs tracking-tight">auro.app/@{profile?.username || 'user'}/</span>
                          </div>
                          <input
                            className="flex-1 bg-transparent border-none text-black text-base font-bold placeholder:text-gray-300 focus:ring-0 px-2 h-full"
                            placeholder="inbox-link"
                            type="text"
                            value={newInboxLink}
                            onChange={(e) => setNewInboxLink(e.target.value)}
                            disabled={isCreatingInbox}
                          />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 pl-1">Use letters, numbers, and dashes only.</p>
                      </div>

                      {/* Inbox Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black pl-1">Inbox Name</label>
                        <div className="bg-white rounded-xl border-2 border-black h-11 flex items-center px-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          <input
                            className="w-full bg-transparent border-none text-black text-base font-bold placeholder:text-gray-300 focus:ring-0 p-0"
                            placeholder="e.g. Late Night Talks"
                            type="text"
                          value={newInboxName}
                          onChange={(e) => setNewInboxName(e.target.value)}
                          disabled={isCreatingInbox}
                        />
                      </div>
                      </div>

                      {/* Prompt Message */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black pl-1">Prompt Message</label>
                        <div className="bg-white rounded-xl border-2 border-black px-3 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          <textarea
                            className="w-full bg-transparent border-none text-black text-base font-bold placeholder:text-gray-300 focus:ring-0 p-0 resize-none h-10 leading-relaxed"
                            placeholder="What question do you want to ask?"
                          value={newInboxPrompt}
                          onChange={(e) => setNewInboxPrompt(e.target.value)}
                          disabled={isCreatingInbox}
                        />
                      </div>
                    </div>

                      {/* Privacy Settings */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black pl-1">Privacy Settings</label>
                        <div className="bg-white border-2 border-black rounded-2xl p-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          <div className="flex items-center bg-white rounded-full p-0.5 relative mb-1.5">
                            <button
                              type="button"
                              onClick={() => setIsPublicInbox(true)}
                              className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all text-xs ${
                                isPublicInbox
                                  ? 'bg-[#FFEB3B] border-2 border-black text-black shadow-sm z-10'
                                  : 'text-gray-400 border-2 border-transparent'
                              }`}
                            >
                              <Globe className="h-4 w-4" />
                              <span className="font-black uppercase">Public</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsPublicInbox(false)}
                              className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all text-xs ${
                                !isPublicInbox
                                  ? 'bg-[#FFEB3B] border-2 border-black text-black shadow-sm z-10'
                                  : 'text-gray-400 border-2 border-transparent'
                              }`}
                            >
                              <Lock className="h-4 w-4" />
                              <span className="font-black uppercase">Private</span>
                            </button>
                          </div>
                          <div className="bg-gray-100 rounded-xl p-3 flex gap-2 items-start border-2 border-transparent">
                            <div className="bg-white rounded-full border-2 border-black h-6 w-6 flex items-center justify-center shrink-0 mt-0.5">
                              <Info className="h-3 w-3 text-black" />
                            </div>
                            <div>
                              <strong className="text-black block mb-0.5 text-xs font-black uppercase">
                                {isPublicInbox ? 'Public Inbox' : 'Private Inbox'}
                              </strong>
                              <p className="text-[11px] text-gray-600 font-bold leading-relaxed">
                                {isPublicInbox
                                  ? 'The inbox will be available on your public profile'
                                  : 'Only people with the password can send messages.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Password Field (only for private inboxes) */}
                      {!isPublicInbox && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-black pl-1">Inbox Password</label>
                          <div className="bg-white rounded-xl border-2 border-black h-11 flex items-center px-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                            <input
                              className="w-full bg-transparent border-none text-black text-base font-bold placeholder:text-gray-300 focus:ring-0 p-0"
                              placeholder="Enter a password"
                              type="password"
                              value={inboxPassword}
                              onChange={(e) => setInboxPassword(e.target.value)}
                              disabled={isCreatingInbox}
                            />
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 pl-1">Required for sending messages to this inbox.</p>
                        </div>
                      )}

                      {/* Submit Button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                        disabled={isCreatingInbox}
                          className="relative w-full bg-black text-[#FFEB3B] font-black text-base h-12 rounded-full border-2 border-black flex items-center justify-center gap-2 hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[2px] active:shadow-none uppercase tracking-wide group disabled:opacity-50"
                      >
                        {isCreatingInbox ? (
                          <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            Create Inbox
                              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                        </button>
                      </div>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>

          {/* Mobile Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Inboxes */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider opacity-80">
                  Total<br/>Inboxes
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                  <InboxIcon className="h-4 w-4" />
            </div>
              </div>
              <span className="text-4xl font-extrabold tracking-tight">{stats.totalInboxes || 0}</span>
            </div>

            {/* Unread Messages */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider opacity-80">
                  Unread<br/>Messages
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                  <MessageCircle className="h-4 w-4" />
                </div>
              </div>
              <span className="text-4xl font-extrabold tracking-tight">{stats.totalMessages || 0}</span>
            </div>

            {/* Total Replies */}
            <div className="col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow duration-200 cursor-pointer">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider opacity-80">Total Replies</span>
                <span className="text-3xl font-extrabold mt-1 tracking-tight">{stats.repliedMessages || 0}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Mobile Tabs and Inbox List */}
          <div>
            <div className="flex gap-2 items-center mb-6 overflow-x-auto no-scrollbar">
              <button className="bg-[#FFC805] text-black px-6 py-2.5 rounded-full font-bold shadow-sm flex items-center gap-2 whitespace-nowrap">
                <InboxIcon className="h-4 w-4" />
                Inboxes
              </button>
              <button className="bg-transparent text-gray-500 px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-white transition whitespace-nowrap">
                <MessageCircle className="h-4 w-4" />
                Messages
              </button>
            </div>

            {/* Mobile Inbox Cards */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 mx-auto text-[#FFC805] animate-spin" />
                  <p className="text-gray-600 mt-4">Loading inboxes...</p>
                </div>
              ) : inboxes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="relative mb-6 inline-block">
                    <div className="h-20 w-20 bg-black rounded-3xl flex items-center justify-center mx-auto">
                      <InboxIcon className="w-10 h-10 text-[#FFC805]" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">No inboxes yet</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-[280px] mx-auto mb-6">
                    Create your first inbox to start receiving anonymous messages from your audience.
                  </p>
                  <button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-[#FFC805] hover:bg-[#FFD025] text-black font-bold py-3 px-6 rounded-xl transition-all inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Inbox
                  </button>
                </div>
              ) : (
                inboxes.map((inbox) => (
                  <MobileInboxCard
                    key={inbox.id}
                    inbox={inbox}
                    username={profile?.username || ''}
                    onDelete={handleDeleteInbox}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* DESKTOP LAYOUT */}
      <main className="hidden md:block min-h-screen pt-20 pb-24 relative bg-[#FAFAFA] text-gray-900 overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-3xl font-black text-gray-900">
                  Dashboard
                </h1>
                <p className="text-base text-gray-600">
                  Welcome back, <span className="text-[#FACC15] font-bold">@{profile?.username}</span>
                </p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <button className="group h-12 px-6 bg-[#FFC805] hover:bg-[#FFD025] text-black font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]">
                    <div className="bg-black/10 rounded-full p-1 group-hover:bg-black/20 transition-colors">
                      <Plus className="h-4 w-4" />
                    </div>
                    <span>Create Inbox</span>
                  </button>
                </DialogTrigger>
                {/* Dialog content is shared between mobile and desktop */}
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {/* Total Inboxes */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider opacity-80">
                  Total<br/>Inboxes
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                  <InboxIcon className="h-4 w-4" />
                </div>
              </div>
              <span className="text-4xl font-extrabold tracking-tight">{stats.totalInboxes || 0}</span>
            </div>

            {/* Unread Messages */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider opacity-80">
                  Unread<br/>Messages
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                  <MessageCircle className="h-4 w-4" />
                </div>
              </div>
              <span className="text-4xl font-extrabold tracking-tight">{stats.totalMessages || 0}</span>
            </div>

            {/* Total Replies */}
            <div className="col-span-2 lg:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow duration-200 cursor-pointer">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider opacity-80">Total Replies</span>
                <span className="text-3xl font-extrabold mt-1 tracking-tight">{stats.repliedMessages || 0}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="inboxes" className="space-y-6">
            <div className="flex gap-2 items-center overflow-x-auto no-scrollbar">
              <TabsList className="bg-transparent border-0 p-0 h-auto gap-2">
                <TabsTrigger 
                  value="inboxes" 
                  className="data-[state=active]:bg-[#FFC805] data-[state=active]:text-black bg-white text-gray-500 px-6 py-2.5 rounded-full font-bold shadow-sm hover:bg-gray-50 transition-all border-0"
                >
                  <InboxIcon className="h-4 w-4 mr-2" />
                  Inboxes
                </TabsTrigger>
                <TabsTrigger 
                  value="messages" 
                  className="data-[state=active]:bg-[#FFC805] data-[state=active]:text-black bg-white text-gray-500 px-6 py-2.5 rounded-full font-bold hover:bg-gray-50 transition-all border-0"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Messages
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Inboxes Tab */}
            <TabsContent value="inboxes" className="space-y-6">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#FACC15] flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-black animate-spin" />
                    </div>
                    <p className="text-gray-600">Loading inboxes...</p>
                  </div>
                ) : inboxes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="relative mb-6 inline-block">
                      <div className="h-20 w-20 bg-black rounded-3xl flex items-center justify-center mx-auto">
                        <InboxIcon className="w-10 h-10 text-[#FACC15]" />
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">No inboxes yet</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-[280px] mx-auto mb-6">
                      Create your first inbox to start receiving anonymous messages from your audience.
                    </p>
                    <button
                        onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold py-3 px-6 rounded-xl transition-all inline-flex items-center gap-2"
                      >
                      <Plus className="w-5 h-5" />
                        Create Your First Inbox
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Desktop: Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {inboxes.map((inbox) => (
                        <MobileInboxCard
                          key={inbox.id}
                          inbox={{
                            id: inbox.id,
                            name: inbox.name,
                            promptText: inbox.promptText,
                            messageCount: inbox.messageCount,
                            visibility: inbox.visibility,
                          }}
                          username={profile?.username || ''}
                          onDelete={handleDeleteInbox}
                        />
                      ))}
                    </div>
                  </>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 font-black">All Unread Messages</CardTitle>
                  <CardDescription className="text-gray-600">
                    Messages from all your inboxes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="popLayout">
                    {allMessages.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="inline-block mb-6">
                          <div className="w-20 h-20 rounded-3xl bg-blue-400 flex items-center justify-center">
                            <MessageCircle className="h-10 w-10 text-white" />
                          </div>
                        </div>
                        <p className="text-gray-600 text-lg">No unread messages</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {allMessages.map((message) => (
                          <Card key={message.id} className="bg-gray-50 border-gray-200">
                              <CardContent className="p-4 sm:p-6 space-y-4">
                                {/* Message Header */}
                                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                                <Badge className="bg-[#FACC15] text-black rounded-lg border-0 font-bold">
                                    {message.inboxes.name}
                                  </Badge>
                                <span className="text-gray-500 flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {message.anon_id}
                                  </span>
                                <span className="text-gray-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(message.created_at).toLocaleString()}
                                  </span>
                                </div>

                                {/* Message Content */}
                              <p className="text-sm sm:text-base text-gray-900 leading-relaxed">
                                  {message.content}
                                </p>

                                {/* Reply Form */}
                                {replyingTo === message.id ? (
                                <div className="space-y-3 p-4 bg-white rounded-xl border border-gray-200">
                                    <div>
                                    <Label className="text-gray-700 mb-2 block text-sm">Your Reply</Label>
                                      <Textarea
                                        placeholder="Type your reply..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                      className="min-h-[120px] border-gray-300 focus:border-[#FACC15]"
                                        disabled={isSubmitting}
                                      />
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => setIsPublicReply(!isPublicReply)}
                                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 justify-start"
                                      >
                                        {isPublicReply ? (
                                          <><Eye className="h-4 w-4 mr-2" /> Public Reply</>
                                        ) : (
                                          <><EyeOff className="h-4 w-4 mr-2" /> Private Reply</>
                                        )}
                                      </Button>
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => {
                                            setReplyingTo(null)
                                            setReplyText("")
                                          }}
                                          disabled={isSubmitting}
                                        className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700"
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          onClick={() => handleReply(message.id)}
                                          disabled={isSubmitting || !replyText.trim()}
                                        className="flex-1 sm:flex-none bg-[#FACC15] hover:bg-[#EAB308] text-black"
                                        >
                                          {isSubmitting ? (
                                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                                          ) : (
                                            <><Send className="h-4 w-4 mr-2" /> Send Reply</>
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                </div>
                                ) : (
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                      onClick={() => setReplyingTo(message.id)}
                                    className="flex-1 bg-[#FACC15] hover:bg-[#EAB308] text-black h-11 font-bold"
                                    >
                                      <Reply className="h-4 w-4 mr-2" />
                                      Reply to this message
                                    </Button>
                                    <Button
                                      onClick={() => router.push(`/dashboard/inbox/${message.inbox_id}`)}
                                    className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 h-11"
                                    >
                                      View in Inbox
                                      <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-8 py-3 pb-6 flex justify-between items-center z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] md:hidden">
        <button className="group flex flex-col items-center gap-1.5 text-[#FFC805]">
          <div className="relative">
            <Home className="h-6 w-6 group-hover:scale-110 transition-transform" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FFC805] rounded-full"></div>
          </div>
          <span className="text-[10px] font-bold tracking-wide">Home</span>
        </button>
        <button className="group flex flex-col items-center gap-1.5 text-gray-400 hover:text-gray-600 transition">
          <BarChart3 className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold tracking-wide">Stats</span>
        </button>
        <button 
          onClick={() => router.push('/settings')}
          className="group flex flex-col items-center gap-1.5 text-gray-400 hover:text-gray-600 transition"
        >
          <Settings className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold tracking-wide">Settings</span>
        </button>
      </nav>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  )
}
