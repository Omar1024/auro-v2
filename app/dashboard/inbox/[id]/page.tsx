"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  Copy,
  Flag, 
  Trash2, 
  Ban,
  Reply,
  Eye,
  EyeOff,
  Loader2,
  Send,
  CheckCircle,
  MessageSquare,
  User,
  MoreHorizontal,
  X,
  Lock,
  Globe,
  Settings
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import html2canvas from "html2canvas"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface Message {
  id: string
  content: string
  anon_id: string
  anon_ip?: string
  created_at: string
  is_replied: boolean
  is_flagged: boolean
  flag_reason?: string
  replies?: {
    id: string
    content: string
    is_public: boolean
    created_at: string
  }[]
}

export default function InboxMessagesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user, profile, loading: authLoading } = useAuth()
  
  const [inbox, setInbox] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [hiddenWords, setHiddenWords] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'unreplied' | 'replied'>('unreplied')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isPublicReply, setIsPublicReply] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Flag dialog state
  const [flagDialog, setFlagDialog] = useState<{ open: boolean; messageId: string; isFlagged: boolean }>({
    open: false,
    messageId: '',
    isFlagged: false
  })
  const [flagReason, setFlagReason] = useState('spam')
  
  // Block dialog state
  const [blockDialog, setBlockDialog] = useState<{ open: boolean; message: Message | null }>({
    open: false,
    message: null
  })

  // Delete message dialog state
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; messageId: string | null }>({
    open: false,
    messageId: null
  })

  // Delete reply dialog state
  const [deleteReplyDialog, setDeleteReplyDialog] = useState<{ open: boolean; replyId: string | null; messageId: string | null }>({
    open: false,
    replyId: null,
    messageId: null
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && params.id) {
      fetchHiddenWords()
      fetchInboxAndMessages()

      const messagesChannel = supabase
        .channel(`inbox_${params.id}_messages`)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'messages', filter: `inbox_id=eq.${params.id}` },
          () => {
            fetchInboxAndMessages()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(messagesChannel)
      }
    }
  }, [user, params.id])

  const fetchHiddenWords = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('hidden_words')
        .select('word')
        .eq('user_id', user.id)

      if (error) throw error
      
      setHiddenWords((data || []).map(item => item.word.toLowerCase()))
    } catch (error) {
      // Silent fail - non-critical
    }
  }

  const fetchInboxAndMessages = async () => {
    setIsLoading(true)
    try {
      const { data: inboxData, error: inboxError } = await supabase
        .from('inboxes')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user?.id)
        .single()

      if (inboxError) throw inboxError

      if (!inboxData) {
        toast({
          title: "❌ Inbox not found",
          description: "This inbox doesn't exist or you don't have access",
          variant: "destructive",
        })
        router.push('/dashboard')
        return
      }

      setInbox(inboxData)

      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          replies(
            id,
            content,
            is_public,
            created_at
          )
        `)
        .eq('inbox_id', params.id)
        .order('created_at', { ascending: false })

      if (messagesError) throw messagesError

      setMessages(messagesData || [])
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
      await fetchInboxAndMessages()
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

  const handleFlagMessage = async () => {
    try {
      if (flagDialog.isFlagged) {
        // Unflag: Update message and delete report
        const { error: updateError } = await supabase
          .from('messages')
          .update({ 
            is_flagged: false,
            flag_reason: null
          })
          .eq('id', flagDialog.messageId)

        if (updateError) throw updateError

        // Delete the report
        const { error: deleteError } = await supabase
          .from('reports')
          .delete()
          .eq('message_id', flagDialog.messageId)

        if (deleteError) throw deleteError
      } else {
        // Flag: Update message and create report
        const { error: updateError } = await supabase
          .from('messages')
          .update({ 
            is_flagged: true,
            flag_reason: flagReason
          })
          .eq('id', flagDialog.messageId)

        if (updateError) throw updateError

        // Create a report entry
        const { error: reportError } = await supabase
          .from('reports')
          .insert([
            {
              message_id: flagDialog.messageId,
              reason: flagReason
            }
          ])

        if (reportError) throw reportError
      }

      toast({
        title: flagDialog.isFlagged ? "✅ Flag removed" : "✅ Message reported",
        description: flagDialog.isFlagged ? "Message has been unflagged" : "Message has been reported for review",
      })

      setFlagDialog({ open: false, messageId: '', isFlagged: false })
      setFlagReason('spam')
      await fetchInboxAndMessages()
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to update flag status",
        variant: "destructive",
      })
    }
  }

  const handleBlockUser = async () => {
    if (!blockDialog.message) return

    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert([
          {
            inbox_id: params.id,
            anon_ip: blockDialog.message.anon_ip,
            blocked_by: user?.id,
          },
        ])

      if (error) throw error

      toast({
        title: "✅ User Blocked",
        description: "This user won't be able to send messages to this inbox anymore",
      })

      setBlockDialog({ open: false, message: null })
      await fetchInboxAndMessages()
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to block user",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMessage = async () => {
    if (!deleteDialog.messageId) return
    
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', deleteDialog.messageId)

      if (error) throw error

      toast({
        title: "✅ Message Deleted",
        description: "The message has been permanently deleted",
      })

      setDeleteDialog({ open: false, messageId: null })
      await fetchInboxAndMessages()
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to delete message",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReply = async () => {
    if (!deleteReplyDialog.replyId || !deleteReplyDialog.messageId) return
    
    try {
      // Delete the reply
      const { error: deleteError } = await supabase
        .from('replies')
        .delete()
        .eq('id', deleteReplyDialog.replyId)

      if (deleteError) throw deleteError

      // Update message to mark as not replied
      const { error: updateError } = await supabase
        .from('messages')
        .update({ is_replied: false })
        .eq('id', deleteReplyDialog.messageId)

      if (updateError) throw updateError

      toast({
        title: "✅ Reply Deleted",
        description: "Your reply has been deleted",
      })

      setDeleteReplyDialog({ open: false, replyId: null, messageId: null })
      await fetchInboxAndMessages()
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to delete reply",
        variant: "destructive",
      })
    }
  }

  const handleToggleReplyVisibility = async (replyId: string, currentVisibility: boolean) => {
    try {
      
      const { data, error } = await supabase
        .from('replies')
        .update({ is_public: !currentVisibility })
        .eq('id', replyId)
        .select()

      if (error) {
        throw error
      }


      toast({
        title: "✅ Visibility Updated",
        description: !currentVisibility ? "Reply is now public" : "Reply is now private",
      })

      await fetchInboxAndMessages()
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to update visibility",
        variant: "destructive",
      })
    }
  }

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/@${profile?.username}/${inbox?.name}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "✅ Link copied!",
        description: "Share this link to receive messages",
      })
    } catch (error) {
      toast({
        title: "❌ Failed to copy",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleShareToTwitter = (message: Message) => {
    const reply = message.replies?.[0]
    if (!reply) return
    
    // Truncate question if too long for tweet (max ~280 chars total)
    const maxQuestionLength = 100
    let question = message.content
    if (question.length > maxQuestionLength) {
      question = question.substring(0, maxQuestionLength) + '...'
    }
    
    // Truncate answer if needed
    const maxAnswerLength = 120
    let answer = reply.content
    if (answer.length > maxAnswerLength) {
      answer = answer.substring(0, maxAnswerLength) + '...'
    }
    
    // Create the question URL
    const questionUrl = `${window.location.origin}/@${profile?.username}/${inbox?.name}`
    
    const text = `${question} -> ${answer}\n\n${questionUrl}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(twitterUrl, '_blank')
  }

  const handleShareToInstagram = async (message: Message) => {
    try {
      // Create a temporary container for the Instagram card
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.left = '-9999px'
      container.style.top = '0'
      container.style.width = '1080px'
      container.style.fontFamily = 'Inter, sans-serif'
      document.body.appendChild(container)

      // Create the card HTML with proper spacing
      container.innerHTML = `
        <div style="background: #FDFBF7; border-radius: 48px; border: 6px solid #000; padding: 60px; box-shadow: 12px 12px 0px 0px #000; width: 100%; box-sizing: border-box;">
          <!-- Question Section -->
          <div style="background: #F5F5F5; border: 4px solid #000; border-radius: 32px; padding: 40px; margin-bottom: 40px;">
            <div style="background: #000; color: #FFF; font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; padding: 8px 16px; border-radius: 8px; display: inline-block; margin-bottom: 20px;">
              Question
            </div>
            <p style="font-size: 42px; font-weight: 900; line-height: 1.3; color: #000; margin: 0; word-wrap: break-word;">
              ${message.content}
            </p>
          </div>

          <!-- Answer Section -->
          <div style="background: #FFE4F0; border: 4px solid #000; border-radius: 32px; padding: 40px; position: relative;">
            <div style="position: absolute; top: -16px; left: 60px; width: 32px; height: 32px; background: #FFE4F0; border-top: 4px solid #000; border-left: 4px solid #000; transform: rotate(45deg);"></div>
            <div style="background: #666; color: #FFF; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; padding: 8px 16px; border-radius: 24px; border: 3px solid #000; display: inline-block; margin-bottom: 20px;">
              Answer
            </div>
            <p style="font-size: 38px; font-weight: 700; line-height: 1.4; color: #000; margin: 0; word-wrap: break-word;">
              ${message.replies?.[0]?.content || ''}
            </p>
          </div>

          <!-- Branding -->
          <div style="margin-top: 40px; display: flex; align-items: center; justify-content: center;">
            <div style="background: #FFEB3B; border: 4px solid #000; border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0;">
              <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 50C50 40.34 57.16 32.5 66 32.5C74.84 32.5 82 40.34 82 50C82 59.66 74.84 67.5 66 67.5C57.16 67.5 50 59.66 50 50ZM50 50C50 59.66 42.84 67.5 34 67.5C25.16 67.5 18 59.66 18 50C18 40.34 25.16 32.5 34 32.5C42.84 32.5 50 40.34 50 50Z" stroke="#000" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span style="font-size: 36px; font-weight: 900; color: #000; letter-spacing: 2px;">AURO</span>
          </div>
        </div>
      `

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 200))

      // Get the actual height of the content
      const cardElement = container.firstElementChild as HTMLElement
      const contentHeight = cardElement.offsetHeight
      const contentWidth = cardElement.offsetWidth

      // Generate canvas with actual content dimensions
      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        width: contentWidth,
        height: contentHeight,
        windowWidth: contentWidth,
        windowHeight: contentHeight,
      })

      // Remove temporary container
      document.body.removeChild(container)

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return
        
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `auro-qa-${message.id.slice(0, 8)}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast({
          title: "✅ Image Downloaded!",
          description: "Share it on Instagram Stories!",
        })
      }, 'image/png', 1.0)
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to generate image",
        variant: "destructive",
      })
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    
    if (diffInMinutes < 1) return '0m ago'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const containsHiddenWord = (text: string) => {
    const lowerText = text.toLowerCase()
    return hiddenWords.some(word => lowerText.includes(word))
  }

  // Filter out messages containing hidden words
  const filteredMessages = messages.filter(m => !containsHiddenWord(m.content))
  const unrepliedMessages = filteredMessages.filter(m => !m.is_replied)
  const repliedMessages = filteredMessages.filter(m => m.is_replied)

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-[#FFEB3B] animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-[#FDFBF7] text-black min-h-screen">
      {/* Header - Mobile & Desktop */}
      <div className="sticky top-0 z-50 bg-[#FDFBF7] border-b-2 border-black">
        {/* Mobile Header - Centered */}
        <div className="md:hidden flex items-center justify-between px-4 py-4">
          <Link href="/dashboard">
            <button className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-white hover:bg-gray-50 active:translate-y-0.5 transition-all text-black">
              <X className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="text-xl font-black tracking-tight uppercase text-black">{inbox?.name || 'Inbox'}</h1>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/inbox/${params.id}/settings`}>
              <button 
                className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-white hover:bg-gray-50 active:translate-y-0.5 transition-all text-black"
                title="Inbox Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
        
        {/* Desktop Header - Left Aligned */}
        <div className="hidden md:flex max-w-7xl mx-auto px-6 py-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-white hover:bg-gray-50 active:translate-y-0.5 transition-all text-black">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <h1 className="text-xl font-black tracking-tight uppercase text-black">{inbox?.name || 'Inbox'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopyLink}
              className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-white hover:bg-gray-50 active:translate-y-0.5 transition-all text-black"
              title="Copy Link"
            >
              <Copy className="w-5 h-5" />
            </button>
            <Link href={`/dashboard/inbox/${params.id}/settings`}>
              <button 
                className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-white hover:bg-gray-50 active:translate-y-0.5 transition-all text-black"
                title="Inbox Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full max-w-md md:max-w-6xl mx-auto pb-20 pt-8 px-5">
        {/* Tabs */}
        <div className="mb-8 bg-gray-200 border-2 border-black p-1 rounded-xl flex items-center relative shadow-[4px_4px_0px_0px_#000000]">
          <button
            onClick={() => setActiveTab('unreplied')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
              activeTab === 'unreplied'
                ? 'bg-[#FFEB3B] text-black border-2 border-black shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Unreplied ({unrepliedMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('replied')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
              activeTab === 'replied'
                ? 'bg-[#FFEB3B] text-black border-2 border-black shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Replied ({repliedMessages.length})
          </button>
        </div>

        {/* Messages Grid - Single column on mobile, 2 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeTab === 'unreplied' && unrepliedMessages.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
              <p className="text-gray-500 font-bold">No unreplied messages</p>
            </div>
          )}
          {activeTab === 'replied' && repliedMessages.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
              <p className="text-gray-500 font-bold">No replied messages</p>
            </div>
          )}
          
          {/* Unreplied Messages */}
          {activeTab === 'unreplied' && unrepliedMessages.map((message) => (
            <article
              key={message.id}
              className="bg-white rounded-3xl p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              {/* Message Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-black bg-gray-100 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-gray-600 bg-gray-100 border-2 border-black px-2.5 py-1 rounded-full">
                      {message.anon_id}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-bold pl-1">
                    {formatTimeAgo(message.created_at)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setFlagDialog({ open: true, messageId: message.id, isFlagged: message.is_flagged })}
                    className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center transition-all hover:translate-y-[-2px] ${
                      message.is_flagged
                        ? 'bg-yellow-400'
                        : 'bg-white hover:bg-yellow-50'
                    }`}
                    title="Flag message"
                  >
                    <Flag className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setBlockDialog({ open: true, message })}
                    className="w-8 h-8 rounded-full border-2 border-black bg-white hover:bg-red-50 transition-all hover:translate-y-[-2px] flex items-center justify-center"
                    title="Block sender"
                  >
                    <Ban className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteDialog({ open: true, messageId: message.id })}
                    className="w-8 h-8 rounded-full border-2 border-black bg-white hover:bg-red-50 transition-all hover:translate-y-[-2px] flex items-center justify-center"
                    title="Delete message"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="mb-6">
                <p className="text-lg font-bold leading-snug text-black">
                  {message.content}
                </p>
              </div>

              {/* Reply Section */}
              {replyingTo === message.id ? (
                <div className="space-y-3">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="min-h-[120px] border-2 border-black rounded-2xl focus:ring-0 focus:border-black bg-white font-bold shadow-[2px_2px_0px_0px_#000000]"
                    disabled={isSubmitting}
                  />
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setIsPublicReply(!isPublicReply)}
                      className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black px-3 py-2 rounded-full border-2 border-black bg-white"
                    >
                      {isPublicReply ? (
                        <><Eye className="h-4 w-4" /> Public</>
                      ) : (
                        <><EyeOff className="h-4 w-4" /> Private</>
                      )}
                    </button>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyText("")
                        }}
                        className="border-2 border-black bg-white text-black hover:bg-gray-50 font-bold rounded-full"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleReply(message.id)}
                        disabled={isSubmitting || !replyText.trim()}
                        className="bg-black text-[#FFEB3B] hover:bg-gray-900 font-black rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
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
                <button
                  onClick={() => setReplyingTo(message.id)}
                  className="w-full bg-black text-[#FFEB3B] font-black text-base py-4 px-4 rounded-full border-2 border-black flex items-center justify-center gap-2 hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#000000] transition-all active:translate-y-[2px] active:shadow-none uppercase tracking-wide"
                >
                  <Reply className="h-5 w-5" />
                  Reply
                </button>
              )}
            </article>
          ))}

          {/* Replied Messages with Special Design */}
          {activeTab === 'replied' && repliedMessages.map((message) => (
            <article
              key={message.id}
              className="bg-white rounded-2xl p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex flex-col gap-4 relative overflow-hidden"
            >
              {/* Glow Effect */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FFEB3B]/20 rounded-full blur-3xl pointer-events-none"></div>

              {/* Message Header */}
              <div className="flex items-start justify-between relative z-10">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md font-mono border-2 border-black">
                      {message.anon_id}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">
                      {formatTimeAgo(message.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {message.replies?.[0]?.is_public ? (
                      <>
                        <Eye className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Public</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 text-gray-500" />
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Private</span>
                      </>
                    )}
                  </div>
                </div>
                {message.replies && message.replies[0] && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-gray-400 hover:text-black transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_#000000] bg-white">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault()
                          handleToggleReplyVisibility(message.replies![0].id, message.replies![0].is_public)
                        }}
                        className="flex items-center gap-2 font-bold cursor-pointer"
                      >
                        {message.replies[0].is_public ? (
                          <>
                            <Lock className="h-4 w-4" />
                            Make Private
                          </>
                        ) : (
                          <>
                            <Globe className="h-4 w-4" />
                            Make Public
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault()
                          setDeleteReplyDialog({ open: true, replyId: message.replies![0].id, messageId: message.id })
                        }}
                        className="flex items-center gap-2 font-bold text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Reply
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Question Section */}
              <div className="space-y-1.5 relative z-10">
                <span className="bg-black text-white text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-sm inline-block">
                  Question
                </span>
                <p className="text-base font-bold leading-snug text-black">
                  {message.content}
                </p>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-black border-dashed"></div>
                </div>
                <span className="relative bg-gray-500 text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border-2 border-black z-10">
                  Your Reply
                </span>
              </div>

              {/* Reply Section */}
              {message.replies && message.replies[0] && (
                <div className="bg-pink-50 border-2 border-black rounded-xl p-3 relative shadow-[2px_2px_0px_0px_#000000]">
                  <div className="absolute -top-1.5 left-6 w-3 h-3 bg-pink-50 border-t-2 border-l-2 border-black transform rotate-45 z-0"></div>
                  <p className="text-sm font-bold text-black relative z-10">
                    {message.replies[0].content}
                  </p>
                </div>
              )}

              {/* Share Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => handleShareToTwitter(message)}
                  className="flex items-center justify-center gap-1.5 bg-black hover:bg-gray-900 text-white py-2 px-3 rounded-lg font-bold text-xs transition-all active:scale-95 border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X
                </button>
                <button
                  onClick={() => handleShareToInstagram(message)}
                  className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white py-2 px-3 rounded-lg font-bold text-xs transition-all active:scale-95 border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.373c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"/>
                  </svg>
                  Instagram
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Flag/Report Dialog */}
      <Dialog open={flagDialog.open} onOpenChange={(open) => !open && setFlagDialog({ open: false, messageId: '', isFlagged: false })}>
        <DialogContent className="bg-white border-2 border-black rounded-3xl shadow-[6px_6px_0px_0px_#000000]">
          <DialogHeader>
            <DialogTitle className="text-black font-black">
              {flagDialog.isFlagged ? 'Remove Report' : 'Report Message'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 font-bold">
              {flagDialog.isFlagged 
                ? 'Are you sure you want to remove the report from this message?' 
                : 'Please select a reason for reporting this message'}
            </DialogDescription>
          </DialogHeader>
          {!flagDialog.isFlagged && (
            <RadioGroup value={flagReason} onValueChange={setFlagReason} className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="spam" id="spam" className="border-2 border-black" />
                <Label htmlFor="spam" className="font-bold text-black cursor-pointer">Spam</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="harassment" id="harassment" className="border-2 border-black" />
                <Label htmlFor="harassment" className="font-bold text-black cursor-pointer">Harassment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inappropriate" id="inappropriate" className="border-2 border-black" />
                <Label htmlFor="inappropriate" className="font-bold text-black cursor-pointer">Inappropriate Content</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hate_speech" id="hate_speech" className="border-2 border-black" />
                <Label htmlFor="hate_speech" className="font-bold text-black cursor-pointer">Hate Speech</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" className="border-2 border-black" />
                <Label htmlFor="other" className="font-bold text-black cursor-pointer">Other</Label>
              </div>
            </RadioGroup>
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                setFlagDialog({ open: false, messageId: '', isFlagged: false })
                setFlagReason('spam')
              }}
              className="border-2 border-black bg-white text-black hover:bg-gray-50 font-bold rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleFlagMessage}
              className={`font-black rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000000] ${
                flagDialog.isFlagged 
                  ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {flagDialog.isFlagged ? 'Remove Report' : 'Report Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Dialog */}
      <Dialog open={blockDialog.open} onOpenChange={(open) => !open && setBlockDialog({ open: false, message: null })}>
        <DialogContent className="bg-white border-2 border-black rounded-3xl shadow-[6px_6px_0px_0px_#000000]">
          <DialogHeader>
            <DialogTitle className="text-black font-black">Block Anonymous User</DialogTitle>
            <DialogDescription className="text-gray-600 font-bold">
              This user won't be able to send messages to this inbox anymore. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setBlockDialog({ open: false, message: null })}
              className="border-2 border-black bg-white text-black hover:bg-gray-50 font-bold rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBlockUser}
              className="bg-red-600 hover:bg-red-700 text-white font-black rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
            >
              Block User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Message Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, messageId: null })}>
        <DialogContent className="bg-white border-2 border-black rounded-3xl shadow-[6px_6px_0px_0px_#000000]">
          <DialogHeader>
            <DialogTitle className="text-black font-black">Delete Message</DialogTitle>
            <DialogDescription className="text-gray-600 font-bold">
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setDeleteDialog({ open: false, messageId: null })}
              className="border-2 border-black bg-white text-black hover:bg-gray-50 font-bold rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteMessage}
              className="bg-red-600 hover:bg-red-700 text-white font-black rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
            >
              Delete Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Reply Confirmation Dialog */}
      <Dialog open={deleteReplyDialog.open} onOpenChange={(open) => !open && setDeleteReplyDialog({ open: false, replyId: null, messageId: null })}>
        <DialogContent className="bg-white border-2 border-black rounded-3xl shadow-[6px_6px_0px_0px_#000000]">
          <DialogHeader>
            <DialogTitle className="text-black font-black">Delete Reply</DialogTitle>
            <DialogDescription className="text-gray-600 font-bold">
              Are you sure you want to delete your reply? This action cannot be undone and the message will be marked as unreplied.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setDeleteReplyDialog({ open: false, replyId: null, messageId: null })}
              className="border-2 border-black bg-white text-black hover:bg-gray-50 font-bold rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteReply}
              className="bg-red-600 hover:bg-red-700 text-white font-black rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
            >
              Delete Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
