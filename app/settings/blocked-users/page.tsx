"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Ban, Loader2, Undo } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

interface BlockedUser {
  id: string
  anon_id: string
  inbox_id: string
  created_at: string
  inboxes: {
    name: string
  }
}

export default function BlockedUsersPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [isLoading, setIsLoading] = useState(true)
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchBlockedUsers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchBlockedUsers = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Get all inboxes belonging to the user
      const { data: inboxes, error: inboxError } = await supabase
        .from('inboxes')
        .select('id')
        .eq('user_id', user.id)

      if (inboxError) throw inboxError

      const inboxIds = inboxes?.map(inbox => inbox.id) || []

      if (inboxIds.length === 0) {
        setBlockedUsers([])
        setIsLoading(false)
        return
      }

      // Get all blocked users for those inboxes
      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          *,
          inboxes (
            name
          )
        `)
        .in('inbox_id', inboxIds)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBlockedUsers(data || [])
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load blocked users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnblock = async (blockedUserId: string) => {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('id', blockedUserId)

      if (error) throw error

      toast({
        title: "✅ User Unblocked",
        description: "This user can now send you messages again",
      })

      fetchBlockedUsers()
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to unblock user",
        variant: "destructive",
      })
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) return `${diffInDays}d ago`
    
    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths}mo ago`
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F4F0] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-black animate-spin" />
      </div>
    )
  }

  return (
    <div 
      className="relative z-10 min-h-screen bg-[#F4F4F0] text-black font-sans antialiased"
      style={{
        backgroundImage: 'radial-gradient(#E5E5E5 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header - Mobile & Desktop */}
        <header className="sticky top-0 z-50 bg-[#F4F4F0]/95 backdrop-blur-sm border-b-2 border-black">
          {/* Mobile Header - Centered */}
          <div className="md:hidden flex items-center justify-between px-4 py-4">
            <button 
              onClick={() => router.push('/settings')}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-black bg-white hover:bg-gray-50 active:translate-y-0.5 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>
            <h1 className="text-xl font-black tracking-tight uppercase text-black">Blocked Users</h1>
            <div className="w-10"></div>
          </div>
          
          {/* Desktop Header - Left Aligned */}
          <div className="hidden md:flex max-w-7xl mx-auto px-6 py-4 items-center gap-4">
            <button 
              onClick={() => router.push('/settings')}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-black bg-white hover:bg-gray-50 active:translate-y-0.5 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>
            <h1 className="text-xl font-black tracking-tight uppercase text-black">Blocked Users</h1>
          </div>
        </header>

        <main className="flex-1 px-5 py-8 space-y-4 overflow-y-auto pb-32">
          {blockedUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 border-2 border-black flex items-center justify-center">
                <Ban className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-black text-black mb-2">No Blocked Users</h3>
              <p className="text-gray-500 text-sm">
                You haven&apos;t blocked any anonymous users yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((blocked) => (
                <div
                  key={blocked.id}
                  className="bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-4 hover:shadow-[6px_6px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 border-2 border-black shrink-0 flex items-center justify-center text-white font-black">
                        <Ban className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-black text-black font-mono truncate">
                            {blocked.anon_id}
                          </h3>
                          <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-red-200">
                            Blocked
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-bold text-gray-500">
                            Inbox: <span className="text-black">{blocked.inboxes.name}</span>
                          </p>
                          <p className="text-xs font-bold text-gray-400">
                            {formatTimeAgo(blocked.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnblock(blocked.id)}
                      className="p-2 rounded-lg border-2 border-black bg-white hover:bg-gray-50 transition-colors ml-2 shrink-0"
                      title="Unblock user"
                    >
                      <Undo className="w-5 h-5 text-black" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

