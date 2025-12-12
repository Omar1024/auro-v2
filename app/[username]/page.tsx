"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send, Heart, Share2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function PublicProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const { toast } = useToast()
  const router = useRouter()
  const [feedItems, setFeedItems] = useState<any[]>([])
  const [userInboxes, setUserInboxes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [totalMessages, setTotalMessages] = useState(0)

  // Reserved routes that should not be treated as usernames
  const RESERVED_ROUTES = [
    'settings', 'dashboard', 'admin', 'api', 'auth', 
    'preview', 'privacy', 'prompts', 'terms', 'test-auth', 'u'
  ]

  useEffect(() => {
    // Check if params.username exists
    if (!params?.username) return
    
    // Check if the username is a reserved route
    if (params?.username && RESERVED_ROUTES.includes(params.username.toLowerCase())) {
      router.push('/')
      return
    }
    
    fetchProfileAndFeed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.username])

  const fetchProfileAndFeed = async () => {
    if (!params?.username) {
      setIsLoading(false)
      return
    }
    
    // Remove @ symbol if present in the URL
    const cleanUsername = params.username.startsWith('@') 
      ? params.username.slice(1) 
      : params.username
    
    try {
      // Get user by username (exact match first, then case-insensitive fallback)
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, profile_picture')
        .eq('username', cleanUsername)
        .maybeSingle()

      // If not found with exact match, try case-insensitive
      if (!userData && !userError) {
        const { data: userDataCaseInsensitive, error: userErrorCaseInsensitive } = await supabase
          .from('users')
          .select('id, username, profile_picture')
          .ilike('username', cleanUsername)
          .maybeSingle()
        
        if (userDataCaseInsensitive) {
          userData = userDataCaseInsensitive
        }
        if (userErrorCaseInsensitive) {
          userError = userErrorCaseInsensitive
        }
      }

      if (userError) {
        console.error('User fetch error:', userError)
        throw userError
      }
      
      if (!userData) {
        console.error('User not found:', cleanUsername)
        toast({
          title: "❌ User Not Found",
          description: `User "${cleanUsername}" doesn't exist`,
          variant: "destructive",
        })
        setIsLoading(false)
        router.push('/')
        return
      }
      
      setUserProfile(userData)

      // Get all public inboxes for this user
      const { data: inboxes, error: inboxError} = await supabase
        .from('inboxes')
        .select('id, name')
        .eq('user_id', userData.id)
        .eq('visibility', 'public')

      if (inboxError) throw inboxError

      setUserInboxes(inboxes || [])
      const inboxIds = (inboxes || []).map(inbox => inbox.id)

      if (inboxIds.length === 0) {
        setFeedItems([])
        setIsLoading(false)
        return
      }

      // Get total message count
      const { count: messageCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('inbox_id', inboxIds)

      setTotalMessages(messageCount || 0)

      // Get messages with public replies - only fetch replied messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          inbox_id,
          is_replied,
          replies!inner(
            content,
            is_public,
            created_at
          )
        `)
        .in('inbox_id', inboxIds)
        .eq('is_replied', true)
        .eq('replies.is_public', true)
        .order('created_at', { ascending: false })

      if (messagesError) throw messagesError

      // Double-check filtering for messages with valid public replies
      const publicReplies = (messages || [])
        .filter(msg => {
          // Ensure the message has been replied to
          if (!msg.is_replied) return false
          
          // Ensure replies exist and are an array
          if (!msg.replies || !Array.isArray(msg.replies) || msg.replies.length === 0) return false
          
          // Ensure the first reply is public and has content
          const firstReply = msg.replies[0]
          if (!firstReply || !firstReply.is_public || !firstReply.content) return false
          
          return true
        })
        .map(msg => {
          // Find the inbox name for this message
          const inbox = inboxes?.find(inbox => inbox.id === msg.inbox_id)
          return {
            id: msg.id,
            question: msg.content,
            answer: msg.replies[0].content,
            timestamp: new Date(msg.replies[0].created_at),
            likes: 0,
            inboxName: inbox?.name || 'Inbox',
          }
        })

      setFeedItems(publicReplies)
    } catch (error: any) {
      console.error('Profile fetch error:', error)
      toast({
        title: "❌ Error",
        description: error?.message || "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return '1d ago'
    return `${days}d ago`
  }

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-gray-900 antialiased pb-24">
      {/* Navigation */}
      {/* Header - Mobile & Desktop */}
      <nav className="fixed top-0 w-full z-50 bg-[#FDFCF7]/90 backdrop-blur-sm border-b-2 border-black">
        {/* Mobile Header - Centered */}
        <div className="md:hidden h-16 flex items-center justify-between px-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-black" />
          </button>
          <span className="font-black text-xl tracking-wider text-black">AURO</span>
          <div className="w-10"></div>
        </div>
        
        {/* Desktop Header - Left Aligned */}
        <div className="hidden md:flex max-w-7xl mx-auto px-6 py-4 items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-white hover:bg-gray-50 active:translate-y-0.5 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
          <span className="font-black text-xl tracking-wider text-black">@{params?.username || ''}</span>
        </div>
      </nav>

      <main className="pt-20 px-4 max-w-md mx-auto w-full">
        {/* Profile Header Card */}
        <div className="relative w-full bg-[#FFF545] rounded-3xl border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-8">
          {/* Dot pattern overlay */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#000000 1.5px, transparent 1.5px)',
              backgroundSize: '20px 20px'
            }}
          />
          
          <div className="relative p-6 flex flex-col items-center text-center z-10">
            {/* Profile Picture */}
            <div className="w-24 h-24 rounded-full bg-white border-[3px] border-black overflow-hidden mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              {userProfile?.profile_picture ? (
                <img 
                  src={userProfile.profile_picture} 
                  alt={params?.username || ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 text-white text-3xl font-black">
                  {params?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>

            {/* Username Badge */}
            <div className="bg-white px-4 py-1 rounded-full border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-2 transform -rotate-2">
              <h1 className="font-black text-xl text-black">@{params?.username || ''}</h1>
            </div>

            {/* Bio */}
            <p className="font-bold text-black mt-2 text-lg leading-tight">
              Send me anonymous messages! 🌶️
            </p>

            {/* Stats */}
            <div className="flex gap-2 mt-4">
              <div className="bg-black text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border-2 border-black">
                {totalMessages.toLocaleString()} Messages
              </div>
            </div>
          </div>
        </div>

        {/* Send Anonymous Message Button */}
        {userInboxes.length > 0 && (
          <div className="sticky top-20 z-40 mb-8 px-2">
            {userInboxes.length === 1 ? (
              <Link href={`/@${params?.username || ''}/${userInboxes[0].name.toLowerCase().replace(/\s+/g, '-')}`}>
                <Button className="w-full bg-[#FACC15] hover:bg-[#EAB308] text-black font-black text-lg py-4 h-auto rounded-2xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 group">
                  <span>SEND ANONYMOUS MESSAGE</span>
                  <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full bg-[#FACC15] hover:bg-[#EAB308] text-black font-black text-lg py-4 h-auto rounded-2xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 group">
                    <span>SEND ANONYMOUS MESSAGE</span>
                    <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border-black border-2">
                  <div className="px-2 py-1.5 text-sm font-bold text-black">
                    Choose an inbox
                  </div>
                  {userInboxes.map((inbox) => (
                    <Link key={inbox.id} href={`/@${params?.username || ''}/${inbox.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      <DropdownMenuItem className="cursor-pointer font-medium text-black hover:bg-gray-100">
                        {inbox.name}
                      </DropdownMenuItem>
                    </Link>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}

        {/* Feed Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-lg uppercase tracking-wider">Recent Q&amp;A</h3>
            <span className="text-xs font-bold bg-green-300 text-black px-2 py-1 rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              PUBLIC
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
            </div>
          ) : feedItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-gray-600 font-medium">No public Q&A yet</p>
              <p className="text-sm text-gray-500 mt-2">Be the first to send a message!</p>
            </div>
          ) : (
            feedItems.map((item) => (
              <article
                key={item.id}
                className="bg-white border-[3px] border-black rounded-2xl p-0 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden group hover:-translate-y-1 transition-transform duration-200"
              >
                {/* Question */}
                <div className="bg-gray-50 p-5 border-b-[3px] border-black relative">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Anonymous asked:
                  </p>
                  <p className="font-black text-xl leading-snug text-gray-900">
                    &quot;{item.question}&quot;
                  </p>
                </div>

                {/* Answer */}
                <div className="p-5 bg-white relative">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden">
                        {userProfile?.profile_picture ? (
                          <img 
                            src={userProfile.profile_picture} 
                            alt={params?.username || ''}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-black">
                            {params?.username?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold text-blue-600">
                          {params?.username || ''} replied:
                        </p>
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-300 px-2 py-0.5 rounded-md">
                          [{item.inboxName}]
                        </span>
                      </div>
                      <p className="text-gray-800 font-medium text-base">
                        {item.answer}
                      </p>
                      <div className="mt-4 flex gap-4 text-gray-400 text-sm font-bold">
                        <button className="flex items-center gap-1 hover:text-black transition-colors">
                          <Heart className="h-4 w-4" /> {item.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-black transition-colors">
                          <Share2 className="h-4 w-4" /> Share
                        </button>
                        <span className="ml-auto text-xs font-normal opacity-60">
                          {formatTimeAgo(item.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 w-full bg-white border-t-2 border-black p-4 flex justify-center z-50">
        <Link href="/" className="text-sm font-bold flex items-center gap-2 hover:opacity-70">
          <span className="bg-[#FFF545] text-black w-6 h-6 flex items-center justify-center rounded border border-black font-black text-xs">
            A
          </span>
          Create your own inbox on Auro
        </Link>
      </div>
    </div>
  )
}
